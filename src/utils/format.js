// turns Zod validation errors into a readable string.

export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'Validation failed';

  if (Array.isArray(errors.issues))
    return errors.issues.map(i => i.message).join(', ');

  return JSON.stringify(errors);
};
