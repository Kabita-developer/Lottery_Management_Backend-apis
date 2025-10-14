const Joi = require('joi');
require('dotenv').config();

const envSchema = Joi.object({
	NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
	PORT: Joi.number().port().default(3000),
	MONGO_URI: Joi.string()
		.uri({ scheme: [/mongodb(\+srv)?/] })
		.default('mongodb://127.0.0.1:27017/lottery_db'),
	JWT_SECRET: Joi.string().min(16).allow('').default(''),
	JWT_EXPIRES_IN: Joi.string().default('7d')
})
	.unknown(true);

const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
	// Fail fast on invalid environment
	throw new Error(`Environment validation error: ${error.message}`);
}

// Provide a safe default secret in non-production if missing
const derivedSecret = env.JWT_SECRET || (env.NODE_ENV !== 'production' ? 'dev_default_change_me_please' : '');

if (env.NODE_ENV === 'production' && !derivedSecret) {
	throw new Error('Environment validation error: JWT_SECRET is required in production');
}

const config = {
	env: env.NODE_ENV,
	port: env.PORT,
	mongoUri: env.MONGO_URI,
	jwts: {
		secret: derivedSecret,
		expiresIn: env.JWT_EXPIRES_IN
	}
};

module.exports = config;


