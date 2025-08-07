const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Auto-create super admin if it doesn't exist
        await createSuperAdmin();
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const createSuperAdmin = async () => {
    try {
        const AppUser = require('./models/AppUser');
        
        // Check if super admin already exists
        const existingSuperAdmin = await AppUser.findOne({ email: 'admin@gmail.com' });
        
        if (!existingSuperAdmin) {
            // Create super admin user
            const superAdmin = new AppUser({
                name: 'Super Admin',
                email: 'admin@gmail.com',
                password: 'admin',
                status: 'true', // Always approved
                isDeletable: 'false' // Cannot be deleted
            });

            await superAdmin.save();
            console.log('Super admin created successfully');
            console.log('Email: admin@gmail.com');
            console.log('Password: admin');
        }
    } catch (error) {
        console.error('Error creating super admin:', error);
    }
};
module.exports = connectDB;