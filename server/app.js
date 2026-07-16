const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Global middleware to sanitize empty strings from payloads
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === "") {
          delete obj[key];
        } else if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          sanitize(obj[key]);
        }
      });
    };
    sanitize(req.body);
  }
  next();
});

// Basic Route for health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running...' });
});

// Define Routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');

const dashboardRoutes = require('./src/routes/dashboard.routes');
const companyRoutes = require('./src/routes/company.routes');
const roleRoutes = require('./src/routes/role.routes');
const approvalRoutes = require('./src/routes/approval.routes');
const auditRoutes = require('./src/routes/audit.routes');
const masterRoutes = require('./src/routes/master.routes');
const engineeringRoutes = require('./src/routes/engineering.routes');
const salesRoutes = require('./src/routes/sales.routes');
const demandRoutes = require('./src/routes/demand.routes');
const mrpRoutes = require('./src/routes/mrp.routes');
const capacityRoutes = require('./src/routes/capacity.routes');
const procurementRoutes = require('./src/routes/procurement.routes');
const receiptRoutes = require('./src/routes/receipt.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const productionRoutes = require('./src/routes/production.routes');
const shopfloorRoutes = require('./src/routes/shopfloor.routes');
const qualityRoutes = require('./src/routes/quality.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');
const dispatchRoutes = require('./src/routes/dispatch.routes');
const financeRoutes = require('./src/routes/finance.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/company', companyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/engineering', engineeringRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/mrp', mrpRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/capacity', capacityRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/shopfloor', shopfloorRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/finance', financeRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
