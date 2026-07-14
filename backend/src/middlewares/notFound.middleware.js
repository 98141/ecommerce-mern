function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'ROUTE_NOT_FOUND', message: 'La ruta solicitada no existe' },
  });
}

module.exports = { notFound };
