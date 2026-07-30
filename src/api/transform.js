function snakeToCamel(key) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(key) {
  return key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}

function isObject(v) {
  return v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v);
}

export function toCamelCase(obj) {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (!isObject(obj)) return obj;
  const out = {};
  for (const k of Object.keys(obj)) {
    out[snakeToCamel(k)] = toCamelCase(obj[k]);
  }
  return out;
}

export function toSnakeCase(obj) {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (!isObject(obj)) return obj;
  const out = {};
  for (const k of Object.keys(obj)) {
    out[camelToSnake(k)] = toSnakeCase(obj[k]);
  }
  return out;
}
