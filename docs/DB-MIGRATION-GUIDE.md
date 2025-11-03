# 🔄 MongoDB to MySQL Migration Guide

**Status:** Future migration plan only - keep MongoDB for now

---

## Overview

This guide explains how to migrate FreightPro from MongoDB (Mongoose) to MySQL (Prisma ORM) in the future.

**Current Stack:**
- MongoDB Atlas (cloud)
- Mongoose ORM
- Schema-less document storage

**Target Stack:**
- MySQL 8.0+ (or PostgreSQL)
- Prisma ORM
- Relational database

---

## Why Migrate?

**MongoDB Pros:**
- ✅ Flexible schema
- ✅ Fast writes
- ✅ Easy horizontal scaling
- ✅ JSON-like queries

**MySQL Pros:**
- ✅ ACID transactions
- ✅ Strong consistency
- ✅ Better for complex joins
- ✅ Mature ecosystem

**Keep MongoDB if:**
- Current setup works well
- Need flexibility for schema changes
- Scaling horizontally

**Migrate to MySQL if:**
- Need complex relationships
- Want stronger consistency guarantees
- Team prefers SQL

---

## Migration Strategies

### Option 1: Full Migration

Migrate all collections to MySQL tables.

**Time:** 40-60 hours  
**Complexity:** High  
**Downtime:** 4-8 hours

### Option 2: Partial Migration

Keep messages in MongoDB, move users & loads to MySQL.

**Time:** 20-30 hours  
**Complexity:** Medium  
**Downtime:** 2-4 hours

**Recommended** for gradual migration.

---

## Prisma Schema Examples

### Users Table

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  company   String
  phone     String
  
  accountType String // carrier, broker, shipper
  
  usdotNumber    String?
  mcNumber       String?
  hasUSDOT       Boolean  @default(false)
  hasMC          Boolean  @default(false)
  
  companyLegalName String?
  dbaName         String?
  
  einCanon   String?
  einDisplay String?
  
  isEmailVerified Boolean @default(false)
  isActive        Boolean @default(true)
  role            String  @default("user") // user, admin
  
  subscriptionPlan String @default("ultima")
  premiumExpires   DateTime
  
  profilePhoto String?
  
  createdAt DateTime @default(now())
  lastLogin DateTime @updatedAt
  
  // Relations
  postedLoads Load[]
  bookedLoads Load[]
  sentMessages Message[]
  receivedMessages Message[]
  
  @@index([accountType])
  @@index([isEmailVerified])
  @@index([email])
}
```

### Loads Table

```prisma
model Load {
  id          String   @id @default(cuid())
  title       String
  description String
  
  originCity      String
  originState     String
  originZip       String
  originLat       Float?
  originLng       Float?
  originCountry   String @default("US")
  
  destCity      String
  destState     String
  destZip       String
  destLat       Float?
  destLng       Float?
  destCountry   String @default("US")
  
  pickupDate    DateTime
  deliveryDate  DateTime
  
  equipmentType String
  weight        Int
  rate          Float
  rateType      String @default("per_mile") // per_mile, flat_rate
  distance      Int?
  
  status String @default("available") // available, booked, in_transit, delivered, cancelled
  
  shipmentId String?
  unlinked   Boolean @default(false)
  
  isInterstate Boolean @default(true)
  
  postedById String
  postedBy   User   @relation("PostedLoads", fields: [postedById], references: [id])
  
  bookedById String?
  bookedBy   User?  @relation("BookedLoads", fields: [bookedById], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([status, pickupDate])
  @@index([postedById])
  @@index([bookedById])
  @@index([originState, destState])
  @@index([equipmentType, status])
  @@index([createdAt])
  @@fulltext([title, description])
}
```

### Messages Table

```prisma
model Message {
  id        String   @id @default(cuid())
  
  senderId   String
  sender     User @relation("SentMessages", fields: [senderId], references: [id])
  
  receiverId String
  receiver   User @relation("ReceivedMessages", fields: [receiverId], references: [id])
  
  loadId     String?
  subject    String
  message    String
  
  isRead    Boolean @default(false)
  isEdited  Boolean @default(false)
  editedAt  DateTime?
  
  createdAt DateTime @default(now())
  
  @@index([senderId, receiverId])
  @@index([receiverId, isRead])
  @@index([createdAt])
}
```

### Shipments Table

```prisma
model Shipment {
  id          String @id @default(cuid())
  shipmentId  String @unique
  title       String
  description String?
  
  pickupCity  String
  pickupState String
  pickupZip   String
  
  deliveryCity  String
  deliveryState String
  deliveryZip   String
  
  status String @default("open") // open, closed
  
  postedById String
  postedBy   User @relation("PostedShipments", fields: [postedById], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([postedById, status])
  @@index([status, createdAt])
}
```

---

## Step-by-Step Migration Plan

### Phase 1: Setup Prisma (4-6 hours)

1. Install Prisma:
```bash
npm install prisma @prisma/client
npm install -D prisma
```

2. Initialize:
```bash
npx prisma init
```

3. Update `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/freightpro"
```

4. Create schema from models above

5. Generate client:
```bash
npx prisma generate
```

### Phase 2: Parallel Run (8-12 hours)

1. Add Prisma alongside Mongoose
2. Write data to both databases
3. Compare results
4. Fix discrepancies

### Phase 3: Data Migration (4-8 hours)

1. Export MongoDB data:
```bash
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json
mongoexport --uri="mongodb+srv://..." --collection=loads --out=loads.json
```

2. Transform to Prisma format

3. Import to MySQL:
```typescript
const users = JSON.parse(fs.readFileSync('users.json'));
await prisma.user.createMany({ data: transformedUsers });
```

### Phase 4: Replace Mongoose (12-20 hours)

1. Update controllers to use Prisma
2. Replace query syntax:
```typescript
// Mongoose
User.findOne({ email })

// Prisma
prisma.user.findUnique({ where: { email } })
```

3. Update transactions

4. Replace complex queries

### Phase 5: Testing (8-12 hours)

1. Run all tests
2. Test CRUD operations
3. Test relationships
4. Performance testing

### Phase 6: Cutover (2-4 hours)

1. Stop application
2. Final data sync
3. Switch connection to MySQL
4. Restart application

### Phase 7: Monitor (ongoing)

1. Monitor logs
2. Check performance
3. Verify data integrity

---

## Partial Migration Example

Keep `messages` in MongoDB, move others to MySQL:

```typescript
// Separate data access layers
import { prisma } from './prisma';
import { Message } from '../models/Message.model';

// Users & Loads from MySQL
const users = await prisma.user.findMany();

// Messages from MongoDB
const messages = await Message.find({ receiver: userId });
```

---

## Query Migration Examples

### Find All Loads

**Mongoose:**
```typescript
const loads = await Load.find({ status: 'available' });
```

**Prisma:**
```typescript
const loads = await prisma.load.findMany({
  where: { status: 'available' }
});
```

### Find with Population

**Mongoose:**
```typescript
const load = await Load.findById(id).populate('postedBy');
```

**Prisma:**
```typescript
const load = await prisma.load.findUnique({
  where: { id },
  include: { postedBy: true }
});
```

### Update with Conditions

**Mongoose:**
```typescript
await Load.updateOne(
  { _id: id, status: 'available' },
  { $set: { status: 'booked', bookedBy: userId } }
);
```

**Prisma:**
```typescript
await prisma.load.updateMany({
  where: { id, status: 'available' },
  data: { status: 'booked', bookedById: userId }
});
```

### Pagination

**Mongoose:**
```typescript
const loads = await Load.find({})
  .skip((page - 1) * limit)
  .limit(limit);
```

**Prisma:**
```typescript
const loads = await prisma.load.findMany({
  skip: (page - 1) * limit,
  take: limit
});
```

---

## Rollback Plan

If migration fails:

1. Keep MongoDB running
2. Switch connection back
3. Restart application
4. Fix issues
5. Try again

**Test in staging first!**

---

## Estimated Timeline

| Phase | Time | Complexity |
|-------|------|------------|
| Setup Prisma | 4-6h | Low |
| Parallel run | 8-12h | Medium |
| Data migration | 4-8h | Medium |
| Code replacement | 12-20h | High |
| Testing | 8-12h | Medium |
| Cutover | 2-4h | High |
| **Total** | **40-60h** | High |

---

## Recommendations

**For now:** Keep MongoDB
- Current setup works well
- No performance issues
- Schema flexibility benefits
- Cloud-hosted, managed

**Consider MySQL if:**
- Need complex joins
- Want ACID guarantees
- Team prefers SQL
- Compliance requires relational DB

**Hybrid approach:** Good compromise
- Keep messages in MongoDB
- Move users/loads to MySQL
- Best of both worlds

---

## References

- Prisma Docs: https://www.prisma.io/docs
- Migration Guide: https://www.prisma.io/docs/guides/migrate-from
- MySQL Docs: https://dev.mysql.com/doc/

