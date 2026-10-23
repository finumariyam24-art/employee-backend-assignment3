// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
app.use(express.json({ limit: '32kb' }));
// Task2: create mongoDB connection
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

function getEmployeePayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'A JSON employee object is required.' };
    }

    const fields = ['name', 'location', 'position', 'salary'];
    for (const field of fields) {
        if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
            return { error: `${field} is required.` };
        }
    }

    const salary = Number(body.salary);
    if (!Number.isFinite(salary) || salary < 0) {
        return { error: 'salary must be a non-negative number.' };
    }

    return {
        value: {
            name: String(body.name).trim(),
            location: String(body.location).trim(),
            position: String(body.position).trim(),
            salary
        }
    };
}

function sendRouteError(res, error) {
    console.error(error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error.' });
} 


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'




//TODO: get single data from db  using api '/api/employeelist/:id'





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}






//TODO: delete a employee data from db by using api '/api/employeelist/:id'





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}



app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        return res.json(employees);
    } catch (error) {
        return sendRouteError(res, error);
    }
});

app.get('/api/employeelist/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid employee ID.' });
    }
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });
        return res.json(employee);
    } catch (error) {
        return sendRouteError(res, error);
    }
});

app.post('/api/employeelist', async (req, res) => {
    const payload = getEmployeePayload(req.body);
    if (payload.error) return res.status(400).json({ error: payload.error });
    try {
        const employee = await Employee.create(payload.value);
        return res.status(201).json(employee);
    } catch (error) {
        return sendRouteError(res, error);
    }
});

app.delete('/api/employeelist/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid employee ID.' });
    }
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });
        return res.json({ message: 'Employee deleted successfully.', employee });
    } catch (error) {
        return sendRouteError(res, error);
    }
});

app.put('/api/employeelist', async (req, res) => {
    const id = req.body && req.body._id;
    if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'A valid employee _id is required.' });
    }
    const payload = getEmployeePayload(req.body);
    if (payload.error) return res.status(400).json({ error: payload.error });
    try {
        const employee = await Employee.findByIdAndUpdate(id, payload.value, {
            new: true,
            runValidators: true
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });
        return res.json(employee);
    } catch (error) {
        return sendRouteError(res, error);
    }
});

app.use('/api', (req, res) => {
    return res.status(404).json({ error: 'API route not found.' });
});

app.use((error, req, res, next) => {
    console.error(error);
    if (req.path.startsWith('/api/')) {
        const status = error.status === 400 ? 400 : 500;
        return res.status(status).json({
            error: status === 400 ? 'Invalid JSON request body.' : 'Internal server error.'
        });
    }
    return next(error);
});
//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to a local .env file.');
    process.exit(1);
}

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
        console.log('Connected to MongoDB Atlas.');
        app.listen(PORT, () => console.log(`Employee API listening on port ${PORT}.`));
    })
    .catch((error) => {
        console.error('Could not connect to MongoDB Atlas:', error.message);
        process.exit(1);
    });

