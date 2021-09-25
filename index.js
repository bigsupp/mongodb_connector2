const mongoose = require('mongoose');
const debug = require('debug')('dbconnect')

let isConnectedBefore = false;

module.exports = async (uri, options) => {
  const DEFAULT_MONGODB_OPTS = {
    // "connectTimeoutMS": 1000,
    // "socketTimeoutMS": 60000,
    "useNewUrlParser": true,
    "useUnifiedTopology": true
  }
  if(!options && uri && typeof(uri)==='object') {
    options = uri
    uri = null
  }
  if(!options) {
    options = DEFAULT_MONGODB_OPTS
  }
  if(process.env.MONGODB_AUTH_USER) {
    options['user'] = process.env.MONGODB_AUTH_USER
    if(process.env.MONGODB_AUTH_PASS) {
      options['pass'] = process.env.MONGODB_AUTH_PASS
    }
    options['authSource'] = process.env.MONGODB_AUTH_DB || 'admin'
  }
  try {
    await mongoose.connect(uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test', options);
  } catch (error) {
    debug('Cannot connect to MongoDB: %o', error)
  }
}

mongoose.connection.on('error', () => {
  debug('Could not connect to MongoDB');
});

mongoose.connection.on('disconnected', async () => {
  debug('Lost MongoDB connection...');
  if (!isConnectedBefore)
    await mongoose.connect();
});
mongoose.connection.on('connected', () => {
  isConnectedBefore = true;
  debug('Connection established to MongoDB');
});

mongoose.connection.on('reconnected', () => {
  debug('Reconnected to MongoDB');
});

// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    debug('Force to close the MongoDB conection');
    process.exit(0);
  });
});