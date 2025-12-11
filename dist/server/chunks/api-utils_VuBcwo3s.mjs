function apiResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function apiError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export { apiError as a, apiResponse as b };
//# sourceMappingURL=api-utils_VuBcwo3s.mjs.map
