import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemas = {
  users: {
    name: String,
    email: { type: String, index: true },
    image: String,
    role: String,
    provider: String,
  },
  projects: {
    name: String,
    description: String,
    status: String,
    priority: String,
    company: String,
    owner: String,
    dueDate: String,
    progress: Number,
    tags: [String],
  },
  workflows: {
    name: String,
    description: String,
    stage: String,
    company: String,
    owner: String,
    roles: [String],
    priority: String,
  },
  products: {
    name: String,
    description: String,
    company: String,
    status: String,
    version: String,
    owner: String,
    progress: Number,
  },
  companies: {
    name: String,
    slug: String,
    description: String,
    url: String,
    goals: [String],
    accent: String,
  },
  goals: {
    title: String,
    description: String,
    company: String,
    progress: Number,
    status: String,
    dueDate: String,
  },
  members: {
    name: String,
    role: String,
    company: String,
    focus: String,
  },
  notifications: {
    title: String,
    message: String,
    type: String,
    read: Boolean,
  },
};

function normalize(doc) {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: String(_id) };
}

function wrap(model) {
  return {
    async find(filter = {}, options = {}) {
      const sort = options.sort ?? { createdAt: -1 };
      let query = model.find(filter).sort(sort).lean();
      if (options.limit) query = query.limit(options.limit);
      return (await query).map(normalize);
    },
    async findOne(filter = {}) {
      return normalize(await model.findOne(filter).lean());
    },
    async findById(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return normalize(await model.findById(id).lean());
    },
    async create(doc) {
      const { id, ...rest } = doc;
      return normalize((await model.create(rest)).toObject());
    },
    async update(id, patch) {
      if (!mongoose.isValidObjectId(id)) return null;
      const { id: _ignore, createdAt, ...clean } = patch;
      return normalize(
        await model.findByIdAndUpdate(id, { $set: clean }, { new: true }).lean()
      );
    },
    async remove(id) {
      if (!mongoose.isValidObjectId(id)) return false;
      const res = await model.deleteOne({ _id: id });
      return res.deletedCount > 0;
    },
    async count(filter = {}) {
      return model.countDocuments(filter);
    },
  };
}

export async function createMongoStore(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const store = { kind: 'mongo' };
  for (const [name, definition] of Object.entries(schemas)) {
    const model =
      mongoose.models[name] ||
      mongoose.model(name, new Schema(definition, { timestamps: true }), name);
    store[name] = wrap(model);
  }
  return store;
}
