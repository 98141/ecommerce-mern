const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const hpp = require('hpp');
const pinoHttp = require('pino-http');

const { corsOptions } = require('./config/cors');
const { logger } = require('./config/logger');
const { requestId } = require('./middlewares/requestId.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const { notFound } = require('./middlewares/notFound.middleware');
const { mongoSanitize } = require('./middlewares/mongoSanitize.middleware');
const { sendSuccess } = require('./shared/helpers/response.helper');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const adminCustomersRoutes = require('./modules/users/adminCustomers.routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(requestId);
app.use(pinoHttp({ logger, genReqId: (req) => req.id }));
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(hpp());
app.use(mongoSanitize);

app.get('/api/v1/health', (req, res) => {
  sendSuccess(res, { data: { status: 'ok' } });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin/customers', adminCustomersRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
