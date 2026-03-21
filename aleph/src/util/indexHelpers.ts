

export const buildQueryParams = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  return queryParams.toString();
};


export function shortId(id: string, n = 8) {
  if (!id) return "";
  return id.length > n ? `${id.slice(0, n)}` : id;
}
