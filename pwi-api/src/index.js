// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, ItemType, SalesOrderStatus, SOApproval } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

/* ---------- Auth helpers ---------- */
function signUser(u) {
  return jwt.sign(
    { sub: u.id, email: u.email, name: u.name, level: u.level },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}
function authOptional(req, _res, next) {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(h.slice(7), JWT_SECRET);
    } catch {
      // ignore invalid token for optional paths
    }
  }
  next();
}
function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
function requireLevel(levels = []) {
  const order = ['STAFF','SUPERVISOR','MANAGER','DIRECTOR'];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (levels.length === 0) return next();
    const allowed = levels.map(l => order.indexOf(l));
    const userIdx = order.indexOf(req.user.level);
    if (userIdx < 0) return res.status(403).json({ error: 'Forbidden' });
    if (allowed.some(idx => userIdx === idx)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

/* ---------------- Home + Health + Debug ---------------- */
app.get('/', (_req, res) => {
  res.type('html').send(`
    <h1>PWI API</h1>
    <p>Server running ✅</p>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/api/customers">/api/customers</a></li>
      <li><a href="/api/items">/api/items</a></li>
      <li><a href="/api/warehouses">/api/warehouses</a></li>
      <li><a href="/api/sales-orders">/api/sales-orders</a></li>
      <li><a href="/api/shipments">/api/shipments</a></li>
      <li><a href="/api/purchase-orders">/api/purchase-orders</a></li>
    </ul>
  `);
});
app.get('/health', (_req, res) => res.json({ ok: true, message: 'PWI API healthy' }));
app.get('/debug/db', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok: true }); }
  catch (e) { console.error('DB DEBUG:', e); res.status(500).json({ ok: false, error: String(e) }); }
});

/* ---------------- Auth ---------------- */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signUser(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, level: user.level } });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ---------------- Customers ---------------- */
app.get('/api/customers', async (_req, res) => {
  try { res.json(await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } })); }
  catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to list customers' }); }
});
app.get('/api/customers/:id', async (req, res) => {
  try {
    const c = await prisma.customer.findUnique({ where: { id: +req.params.id } });
    if (!c) return res.status(404).json({ error: 'Customer not found' });
    res.json(c);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to get customer' }); }
});
app.patch('/api/customers/:id', requireAuth, requireLevel(['MANAGER','DIRECTOR']), async (req, res) => {
  try {
    const { name, address, phone, creditTermsDays, outstandingBalance } = req.body || {};
    const updated = await prisma.customer.update({
      where: { id: +req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(creditTermsDays !== undefined ? { creditTermsDays: Number(creditTermsDays) } : {}),
        ...(outstandingBalance !== undefined ? { outstandingBalance: String(outstandingBalance) } : {}),
      }
    });
    res.json(updated);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to update customer' }); }
});

/* ---------------- Items ---------------- */
app.get('/api/items', async (_req, res) => {
  try { res.json(await prisma.item.findMany({ orderBy: { id: 'desc' } })); }
  catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to list items' }); }
});
app.post('/api/items', requireAuth, async (req, res) => {
  try {
    const { sku, name, type, uom, unitPrice, safetyStock } = req.body || {};
    if (!sku || !name || !type) return res.status(400).json({ error: 'sku, name, type are required' });
    if (!Object.values(ItemType).includes(type)) return res.status(400).json({ error: `type must be one of ${Object.values(ItemType).join(', ')}` });
    const created = await prisma.item.create({
      data: { sku, name, type, uom: uom || null, unitPrice: unitPrice !== undefined ? String(unitPrice) : null, safetyStock: safetyStock !== undefined ? String(safetyStock) : null }
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'sku must be unique' });
    console.error(e.stack || e); res.status(500).json({ error: 'Failed to create item' });
  }
});

/* ---------------- Warehouses ---------------- */
app.get('/api/warehouses', async (_req, res) => {
  try { res.json(await prisma.warehouse.findMany({ orderBy: { id: 'asc' } })); }
  catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to list warehouses' }); }
});
app.post('/api/warehouses', requireAuth, requireLevel(['SUPERVISOR','MANAGER','DIRECTOR']), async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const wh = await prisma.warehouse.create({ data: { name }});
    res.status(201).json(wh);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'warehouse name must be unique' });
    console.error(e.stack || e); res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

/* ---------------- Stock Receive ---------------- */
app.post('/api/stock/receive', requireAuth, requireLevel(['SUPERVISOR','MANAGER','DIRECTOR']), async (req, res) => {
  const { itemId, sku, warehouseId, batchNo, qty, unitCost, receivedAt, expiry } = req.body || {};
  if ((!itemId && !sku) || !warehouseId || !qty) return res.status(400).json({ error: 'sku (or itemId), warehouseId, qty are required' });

  try {
    let finalItemId = itemId;
    if (!finalItemId && sku) {
      const item = await prisma.item.findUnique({ where: { sku } });
      if (!item) return res.status(404).json({ error: `Item with SKU ${sku} not found` });
      finalItemId = item.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.create({
        data: {
          itemId: +finalItemId, warehouseId: +warehouseId,
          batchNo: batchNo || null, qtyOnHand: String(qty), qtyReserved: '0',
          unitCost: unitCost !== undefined ? String(unitCost) : null,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
          expiry: expiry ? new Date(expiry) : null
        }
      });
      await tx.stockMovement.create({
        data: { itemId: +finalItemId, batchNo: batchNo || null, fromWhId: null, toWhId: +warehouseId, qty: String(qty), movementType: 'GR', relatedDoc: `GR-${stock.id}` }
      });
      return stock;
    });

    res.status(201).json(result);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to receive stock' }); }
});

/* ---------------- Sales: list/create/get/approve ---------------- */
app.get('/api/sales-orders', async (req, res) => {
  try {
    const { status, approvalStatus, customerId } = req.query;
    const where = {
      ...(status ? { status } : {}),
      ...(approvalStatus ? { approvalStatus } : {}),
      ...(customerId ? { customerId: +customerId } : {}),
    };
    const list = await prisma.salesOrder.findMany({
      where, orderBy: { id: 'desc' }, include: { customer: true, items: { select: { id: true } } }
    });
    res.json(list);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to list sales orders' }); }
});

app.post('/api/sales-orders', requireAuth, async (req, res) => {
  const { soNo, customerId, items } = req.body || {};
  if (!soNo || !customerId || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'soNo, customerId, and at least one item are required' });

  try {
    const itemsWithIds = [];
    for (const it of items) {
      let finalItemId = it.itemId;
      if (!finalItemId && it.sku) {
        const found = await prisma.item.findUnique({ where: { sku: it.sku } });
        if (!found) return res.status(404).json({ error: `Item with SKU ${it.sku} not found` });
        finalItemId = found.id;
      }
      if (!finalItemId) return res.status(400).json({ error: 'Each item needs sku or itemId' });
      itemsWithIds.push({ itemId: +finalItemId, qtyOrdered: String(it.qtyOrdered), unitPrice: String(it.unitPrice ?? 0) });
    }

    const cust = await prisma.customer.findUnique({ where: { id: +customerId } });
    if (!cust) return res.status(404).json({ error: 'Customer not found' });

    const hasOutstanding = Number(cust.outstandingBalance) > 0;

    const created = await prisma.salesOrder.create({
      data: {
        soNo,
        customerId: +customerId,
        status: SalesOrderStatus.CREATED,
        approvalStatus: hasOutstanding ? SOApproval.WAITING_MANAGER : SOApproval.AUTO_APPROVED,
        items: { create: itemsWithIds }
      },
      include: { customer: true, items: true }
    });

    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'soNo must be unique' });
    console.error(e.stack || e); res.status(500).json({ error: 'Failed to create sales order' });
  }
});

app.get('/api/sales-orders/:id', async (req, res) => {
  try {
    const so = await prisma.salesOrder.findUnique({
      where: { id: +req.params.id },
      include: { customer: true, items: { include: { item: true, allocations: { include: { stock: true } } } } }
    });
    if (!so) return res.status(404).json({ error: 'Sales Order not found' });
    res.json(so);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to get sales order' }); }
});

// Only MANAGER and DIRECTOR can approve
app.post('/api/sales-orders/:id/approve', requireAuth, requireLevel(['MANAGER','DIRECTOR']), async (req, res) => {
  const id = +req.params.id;
  const { level } = req.body || {};
  if (!['manager','director'].includes(level)) return res.status(400).json({ error: 'level must be manager or director' });

  try {
    const so = await prisma.salesOrder.findUnique({ where: { id } });
    if (!so) return res.status(404).json({ error: 'Sales Order not found' });

    // Enforce the correct person is pressing the correct step
    if (level === 'manager' && req.user.level !== 'MANAGER' && req.user.level !== 'DIRECTOR') {
      return res.status(403).json({ error: 'Only Manager or Director can perform manager approval' });
    }
    if (level === 'director' && req.user.level !== 'DIRECTOR') {
      return res.status(403).json({ error: 'Only Director can perform director approval' });
    }

    let data = {};
    if (level === 'manager') {
      if (so.approvalStatus !== SOApproval.WAITING_MANAGER)
        return res.status(400).json({ error: `Cannot manager-approve when status is ${so.approvalStatus}` });
      data = { approvalStatus: SOApproval.WAITING_DIRECTOR, approvedManagerAt: new Date() };
    } else {
      if (so.approvalStatus === SOApproval.WAITING_DIRECTOR) {
        data = { approvalStatus: SOApproval.APPROVED, approvedDirectorAt: new Date() };
      } else if (so.approvalStatus === SOApproval.AUTO_APPROVED || so.approvalStatus === SOApproval.APPROVED) {
        data = {};
      } else {
        return res.status(400).json({ error: `Cannot director-approve when status is ${so.approvalStatus}` });
      }
    }

    const updated = Object.keys(data).length
      ? await prisma.salesOrder.update({ where: { id }, data })
      : so;

    res.json(updated);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Approval failed' }); }
});

/* ---------------- FIFO Allocation ---------------- */
app.post('/api/sales-orders/:id/allocate', requireAuth, async (req, res) => {
  const soId = +req.params.id;
  const { warehouseId } = req.body || {};
  if (!warehouseId) return res.status(400).json({ error: 'warehouseId is required' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const so = await tx.salesOrder.findUnique({
        where: { id: soId },
        include: { items: { include: { item: true, allocations: true } } }
      });
      if (!so) throw new Error('Sales Order not found');

      const allocationSummary = [];
      for (const soi of so.items) {
        if (soi.item.type !== 'FG') continue;

        const allocated = soi.allocations.reduce((acc, a) => acc + Number(a.qty), 0);
        let need = Number(soi.qtyOrdered) - allocated;
        if (need <= 0) continue;

        const batches = await tx.stock.findMany({
          where: { itemId: soi.itemId, warehouseId: +warehouseId },
          orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }]
        });

        for (const b of batches) {
          if (need <= 0) break;
          const available = Number(b.qtyOnHand) - Number(b.qtyReserved);
          if (available <= 0) continue;

          const take = Math.min(need, available);
          await tx.salesAllocation.create({ data: { salesOrderItemId: soi.id, stockId: b.id, qty: String(take) } });
          await tx.stock.update({ where: { id: b.id }, data: { qtyReserved: String(Number(b.qtyReserved) + take) } });

          allocationSummary.push({ salesOrderItemId: soi.id, stockId: b.id, batchNo: b.batchNo, qty: take });
          need -= take;
        }
      }

      if (allocationSummary.length > 0 && so.status === SalesOrderStatus.CREATED) {
        await tx.salesOrder.update({ where: { id: soId }, data: { status: SalesOrderStatus.PENDING } });
      }

      return { allocations: allocationSummary };
    });

    res.json(result);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: e.message || 'Allocation failed' }); }
});

/* ---------------- Shipments ---------------- */
app.post('/api/sales-orders/:id/ship', requireAuth, requireLevel(['SUPERVISOR','MANAGER','DIRECTOR']), async (req, res) => {
  const soId = +req.params.id;
  const { sjNo, shipAllAllocated = true, items, warehouseId } = req.body || {};

  try {
    const result = await prisma.$transaction(async (tx) => {
      const so = await tx.salesOrder.findUnique({
        where: { id: soId },
        include: { items: { include: { allocations: { include: { stock: true } } } } }
      });
      if (!so) throw new Error('Sales Order not found');

      let lines = [];
      if (shipAllAllocated) {
        for (const soi of so.items) {
          for (const a of soi.allocations) {
            const qty = Number(a.qty);
            if (qty > 0) lines.push({ salesOrderItemId: soi.id, stockId: a.stockId, qty });
          }
        }
      } else {
        if (!Array.isArray(items) || items.length === 0)
          throw new Error('Provide items[] for partial shipment or set shipAllAllocated=true');
        lines = items.map(l => ({ salesOrderItemId: +l.salesOrderItemId, stockId: +l.stockId, qty: Number(l.qty) }));
      }
      if (lines.length === 0) throw new Error('No allocated quantity to ship');

      const header = await tx.shipment.create({
        data: { soId, warehouseId: warehouseId ? +warehouseId : null, sjNo: sjNo || null, shippedAt: new Date() }
      });

      for (const line of lines) {
        const alloc = await tx.salesAllocation.findFirst({ where: { salesOrderItemId: line.salesOrderItemId, stockId: line.stockId } });
        if (!alloc) throw new Error(`No allocation for SOI ${line.salesOrderItemId} & stock ${line.stockId}`);

        const batch = await tx.stock.findUnique({ where: { id: line.stockId } });
        if (!batch) throw new Error(`Stock batch ${line.stockId} not found`);

        const reserved = Number(batch.qtyReserved);
        const onHand  = Number(batch.qtyOnHand);
        if (reserved < line.qty) throw new Error(`Reserved < ship qty for stock ${line.stockId}`);
        if (onHand  < line.qty) throw new Error(`OnHand < ship qty for stock ${line.stockId}`);

        await tx.stock.update({
          where: { id: line.stockId },
          data: { qtyReserved: String(reserved - line.qty), qtyOnHand: String(onHand - line.qty) }
        });

        await tx.stockMovement.create({
          data: {
            itemId: batch.itemId, batchNo: batch.batchNo, fromWhId: batch.warehouseId, toWhId: null,
            qty: String(line.qty), movementType: 'Sale_Shipment', relatedDoc: `SJ-${header.id}`
          }
        });

        await tx.shipmentItem.create({
          data: { shipmentId: header.id, salesOrderItemId: line.salesOrderItemId, stockId: line.stockId, qty: String(line.qty) }
        });

        const soi = await tx.salesOrderItem.findUnique({ where: { id: line.salesOrderItemId } });
        await tx.salesOrderItem.update({
          where: { id: soi.id },
          data: { qtyFulfilled: String(Number(soi.qtyFulfilled) + line.qty) }
        });

        const newAllocQty = Number(alloc.qty) - line.qty;
        if (newAllocQty <= 0) await tx.salesAllocation.delete({ where: { id: alloc.id } });
        else await tx.salesAllocation.update({ where: { id: alloc.id }, data: { qty: String(newAllocQty) } });
      }

      const itemsAfter = await tx.salesOrderItem.findMany({ where: { salesOrderId: soId } });
      const fully = itemsAfter.every(it => Number(it.qtyFulfilled) >= Number(it.qtyOrdered));
      const newStatus = fully ? SalesOrderStatus.FULLY_SHIPPED : SalesOrderStatus.PARTIALLY_SHIPPED;
      await tx.salesOrder.update({ where: { id: soId }, data: { status: newStatus } });

      const out = await tx.shipment.findUnique({ where: { id: header.id }, include: { items: true } });
      return out;
    });

    res.status(201).json(result);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: e.message || 'Shipment failed' }); }
});

app.get('/api/shipments', requireAuth, async (_req, res) => {
  try {
    const data = await prisma.shipment.findMany({
      orderBy: { id: 'desc' },
      include: { salesOrder: { select: { soNo: true } }, items: true }
    });
    res.json(data);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to list shipments' }); }
});

app.get('/api/shipments/:id', requireAuth, async (req, res) => {
  try {
    const sh = await prisma.shipment.findUnique({
      where: { id: +req.params.id },
      include: { salesOrder: true, items: { include: { stock: true, salesOrderItem: true } } }
    });
    if (!sh) return res.status(404).json({ error: 'Shipment not found' });
    res.json(sh);
  } catch (e) { console.error(e.stack || e); res.status(500).json({ error: 'Failed to get shipment' }); }
});

app.listen(PORT, () => {
  console.log(`🚀 PWI API listening on http://localhost:${PORT}`);
});

// Purchases

// List POs
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({ include: { supplier: true } });
    res.json(pos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Create PO
app.post('/api/purchase-orders', async (req, res) => {
  try {
    const { poNo, supplierId } = req.body;
    const po = await prisma.purchaseOrder.create({
      data: { poNo, supplierId: Number(supplierId) }
    });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create PO' });
  }
});

// List PRs
app.get('/api/purchase-requests', async (req, res) => {
  try {
    const prs = await prisma.purchaseRequest.findMany({ include: { requestedBy: true } });
    res.json(prs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch PRs' });
  }
});

// Create PR
app.post('/api/purchase-requests', async (req, res) => {
  try {
    const { prNo, requestedById } = req.body;
    const pr = await prisma.purchaseRequest.create({
      data: { prNo, requestedById: requestedById ? Number(requestedById) : null }
    });
    res.json(pr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create PR' });
  }
});

// Get one PO

app.get('/api/purchase-orders/:id', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: Number(req.params.id) },
      include: { supplier: true, items: { include: { item: true } } },
    });
    if (!po) return res.status(404).json({ error: 'PO not found' });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch PO' });
  }
});


// Approve PO (Directors only)
app.post('/api/purchase-orders/:id/approve', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'APPROVED' },
    });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve PO' });
  }
});

// Reject PO
app.post('/api/purchase-orders/:id/reject', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'REJECTED' },
    });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject PO' });
  }
});


// Get one PR
app.get('/api/purchase-requests/:id', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: Number(req.params.id) },
      include: { requestedBy: true },
    });
    if (!pr) return res.status(404).json({ error: 'PR not found' });
    res.json(pr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch PR' });
  }
});

// Validate (Manager)
app.post('/api/purchase-requests/:id/validate', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.update({
      where: { id: Number(req.params.id) },
      data: { status: 'VALIDATED' },
    });
    res.json(pr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to validate PR' });
  }
});

// Approve (Director)
app.post('/api/purchase-requests/:id/approve', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.update({
      where: { id: Number(req.params.id) },
      data: { status: 'APPROVED' },
    });
    res.json(pr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve PR' });
  }
});

// Reject (Director)
app.post('/api/purchase-requests/:id/reject', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.update({
      where: { id: Number(req.params.id) },
      data: { status: 'REJECTED' },
    });
    res.json(pr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject PR' });
  }
});


//Staff approves PR >> auto-create PO
app.post('/api/purchase-requests/:id/approve', async (req, res) => {
  try {
    const prId = Number(req.params.id);

    // Approve PR
    const pr = await prisma.purchaseRequest.update({
      where: { id: prId },
      data: { status: 'APPROVED' },
    });

    // Create PO linked to PR
    const po = await prisma.purchaseOrder.create({
      data: {
        poNo: `PO-${Date.now()}`,
        supplierId: req.body.supplierId, // staff must pick supplier
        requestId: prId,
        status: 'CREATED',
      },
    });

    res.json({ pr, po });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve PR / create PO' });
  }
});


//Staff validates PO >> Status = Waiting for Approval
app.post('/api/purchase-orders/:id/validate', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'WAITING_FOR_APPROVAL' },
    });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to validate PO' });
  }
});


// Director approves PO
app.post('/api/purchase-orders/:id/approve', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'APPROVED' },
    });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve PO' });
  }
});


// Director Rejects PO
app.post('/api/purchase-orders/:id/reject', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'REJECTED' },
    });
    res.json(po);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject PO' });
  }
});

