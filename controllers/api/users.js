const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const GroceryList = require('../../models/groceryList');
const Pantry = require('../../models/pantry');

module.exports = {
    create,
    login,
    
};

async function create(req, res) {
    try {
        const user = await User.create(req.body);
        const token = createJWT(user);

        const groceryList = new GroceryList({
            user: user._id,
            list: []
        });
        await groceryList.save();

        const pantry = new Pantry({
            user: user._id,
            list: []
        });
        await pantry.save();
        
        res.json(token);
    } catch (error) {
        res.status(400).json(error);
    }
}

async function login(req, res) {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) throw new Error();

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) throw new Error();

        const token = createJWT(user);
        res.json(token);
    } catch (error) {
        res.status(400).json('Bad Credentials');
    }
}



//Helper functions
function createJWT(user) {
    return jwt.sign(
        //data payload
        {user},
        process.env.SECRET,
        //{expiresIn: '24h'}
    );
}