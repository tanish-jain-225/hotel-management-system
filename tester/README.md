# Tester Folder

This folder contains a standalone utility for seeding the DineEase database.

## Menu Seeder

Seeds the `menuItems` collection with a standard DineEase menu that matches the client UI and backend schema.
The seeder only writes when the collection is empty. If records already exist, it exits without changing data unless you pass `--reset`.

### Run

From the `tester` folder:

```bash
npm install
npm run dev
```

### Options

- `--reset` — clears the existing `menuItems` collection before seeding
- `--dry-run` — prints the number of menu items without writing to the database

Examples:

```bash
npm run seed:reset
npm run seed:dry
```

## Environment

The script reads `tester/.env` automatically and expects `MONGO_URI` to be set there.
