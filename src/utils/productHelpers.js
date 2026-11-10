export const createEmptyBundleItem = () => ({
  title: '',
  details: '',
  price: '',
  originalPrice: '',
  image: '',
});

export const createEmptyCustomizationGroup = () => ({
  name: '',
  optionsText: '',
  useInPricing: true,   // <-- new field, defaults to true
});

export const createEmptyPricingMatrixRow = () => ({
  selections: {},
  price: '',
});

export const createEmptyProductForm = () => ({
  name: '',
  description: '',
  price: '',
  categoryId: '',
  images: [],
  sku: '',
  productType: 'standard',
  bundleGroup: '',
  compareAtPrice: '',
  discountText: '',
  shortNote: '',
  materialsText: '',
  bundleItems: [],
  uploadNote: '',
  customizationEnabled: true,
  customizationTitle: 'Customization Options',
  customizationNote: '',
  customizationGroups: [],
  pricingMatrix: [],
  customizationOptionsText: '',
});

export const normaliseBundleItems = (items = []) =>
  items
    .map((item) => ({
      title: (item.title || '').trim(),
      details: (item.details || '').trim(),
      image: (item.image || '').trim(),
      price: item.price === '' ? null : Number(item.price),
      originalPrice: item.originalPrice === '' ? null : Number(item.originalPrice),
    }))
    .filter((item) => item.title);

export const splitLines = (value = '') =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

export const splitValues = (value = '') =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const normaliseCustomizationGroups = (groups = []) =>
  groups
    .map((group) => ({
      name: (group.name || '').trim(),
      options: splitValues(group.optionsText || group.options || ''),
      useInPricing: group.useInPricing ?? true,   // <-- preserve or default to true
    }))
    .filter((group) => group.name && group.options.length);

export const normalisePricingMatrix = (rows = [], groups = []) => {
  const groupNames = groups.map((group) => group.name).filter(Boolean);

  return rows
    .map((row) => {
      const selections = Object.fromEntries(
        groupNames
          .map((groupName) => [groupName, row.selections?.[groupName] || ''])
          .filter(([, value]) => value)
      );

      return {
        selections,
        price: row.price === '' ? null : Number(row.price),
      };
    })
    .filter((row) => row.price !== null && groupNames.every((groupName) => row.selections[groupName]));
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPriceDisplay = (value) => {
  if (typeof value === 'number') {
    return formatCurrency(value);
  }

  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return 'Inquiry';
  }

  const rangeParts = raw
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean);

  if (rangeParts.length === 2 && rangeParts.every((part) => !Number.isNaN(Number(part)))) {
    return `${formatCurrency(Number(rangeParts[0]))} - ${formatCurrency(Number(rangeParts[1]))}`;
  }

  if (!Number.isNaN(Number(raw))) {
    return formatCurrency(Number(raw));
  }

  return raw;
};

export const normaliseProductPrice = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return 0;
  }

  return !Number.isNaN(Number(raw)) ? Number(raw) : raw;
};

export const parseCustomizationOption = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';

  if (!raw) {
    return null;
  }

  const pipeMatch = raw.match(/^(.*?)\s*\|\s*(\d+(?:\.\d+)?)$/);
  if (pipeMatch) {
    return {
      label: pipeMatch[1].trim(),
      price: Number(pipeMatch[2]),
      raw,
    };
  }

  const bracketMatch = raw.match(/^(.*?)\s*\(\+?\s*(\d+(?:\.\d+)?)\s*\)$/);
  if (bracketMatch) {
    return {
      label: bracketMatch[1].trim(),
      price: Number(bracketMatch[2]),
      raw,
    };
  }

  const dashMatch = raw.match(/^(.*?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (dashMatch) {
    return {
      label: dashMatch[1].trim(),
      price: Number(dashMatch[2]),
      raw,
    };
  }

  return {
    label: raw,
    price: 0,
    raw,
  };
};

export const groupCustomizationOptions = (values = [], fallbackGroupLabel = 'Customization') => {
  const groupsMap = new Map();

  values.forEach((value) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return;

    let groupLabel = fallbackGroupLabel;
    let optionValue = raw;

    const colonIndex = raw.indexOf(':');
    if (colonIndex > -1) {
      const possibleGroup = raw.slice(0, colonIndex).trim();
      const possibleOption = raw.slice(colonIndex + 1).trim();

      if (possibleGroup && possibleOption) {
        groupLabel = possibleGroup;
        optionValue = possibleOption;
      }
    }

    const parsedOption = parseCustomizationOption(optionValue);
    if (!parsedOption) return;

    const existingGroup = groupsMap.get(groupLabel) || [];
    existingGroup.push({
      ...parsedOption,
      groupLabel,
    });
    groupsMap.set(groupLabel, existingGroup);
  });

  return Array.from(groupsMap.entries()).map(([label, options]) => ({
    label,
    options,
  }));
};

export const findPricingMatrixMatch = (rows = [], selections = {}, groups = []) => {
  const normaliseKey = (value = '') => value.toString().trim().toLowerCase();
  const groupNames = groups.map((group) => group.label || group.name).filter(Boolean);

  if (!rows.length || !groupNames.length) {
    return null;
  }

  const hasAllSelections = groupNames.every((groupName) => selections[groupName]);
  if (!hasAllSelections) {
    return null;
  }

  return (
    rows.find((row) =>
      groupNames.every((groupName) => {
        const targetSelection = normaliseKey(selections[groupName]);
        const rowEntry = Object.entries(row.selections || {}).find(
          ([rowGroupName]) => normaliseKey(rowGroupName) === normaliseKey(groupName)
        );

        return rowEntry ? normaliseKey(rowEntry[1]) === targetSelection : false;
      })
    ) || null
  );
};

export const isBundleProduct = (product) =>
  product?.productType === 'bundle' ||
  (Array.isArray(product?.bundleItems) && product.bundleItems.length > 0);

export const isStandardProduct = (product) => !isBundleProduct(product);