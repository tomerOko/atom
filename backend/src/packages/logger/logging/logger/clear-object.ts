const removeCircularReferences = (obj: any) => {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return undefined; // Remove circular reference
        }
        seen.add(value);
      }
      return value;
    })
  );
};

const truncate = (obj: any, logMaxLength: number): any => {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string' && obj.length > logMaxLength) {
      return obj.substring(0, logMaxLength) + '... [truncated]';
    }
    return obj;
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = truncate(obj[key], logMaxLength);
    }
  }

  return result;
};

const sanitizeSensitiveData = (data: Record<string, any>): Record<string, any> => {
  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
  for (const field of sensitiveFields) {
    if (field in data) {
      data[field] = '******';
    }
  }

  return data;
};

export const clearObject = (
  obj: Record<string, any>,
  logMaxLength: number
): Record<string, any> => {
  const withoutCircular = removeCircularReferences(obj);
  const sanitized = sanitizeSensitiveData(withoutCircular);
  const truncated = truncate(sanitized, logMaxLength);
  return truncated;
};
