require('dotenv').config({ path: './secure.env' });

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    snippet: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }

})

const Post = mongoose.model('Post', postSchema);

const dbUrl = process.env.MONGODB_URI;

if (!dbUrl) {
    console.error('ERROR: MONGODB_URI is not set. Please set it in secure.env or env.');
    process.exit(1);
}

mongoose.connect(dbUrl).then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.get('/', async (req, res) => {
    // res.send("Welcome to Ansh's Blog");
    try {
        const blogs = await Post.find().sort({ createdAt: -1 });
        res.render('index', { title: 'All Blogs', blogs: blogs });
    } catch (err) {
        console.log(err);
    }
});

app.post('/add-blog', async (req, res) => {
    const post = new Post({
        title: req.body.title,
        snippet: req.body.snippet,
        body: req.body.body,
        author: req.body.author,
    });
    try {
        const result = await post.save();
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }

})

app.get('/delete-blog/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Post.findByIdAndDelete(id);
        console.log("Blog sucessfully delete ho gya hai!");
        res.redirect('/')
    } catch (err) {
        console.log("Delete krne me error aa gya hai")
    }
})

app.get('/create', (req, res) => {
    res.render('create');

})

// Sirf ye ek route rakhiye details ke liye (app.listen ke upar)
app.get('/blogs/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await Post.findById(id);
        if (!result) {
            return res.status(404).send("Blog nahi mila!");
        }
        res.render('details', { blog: result, title: 'Blog Details' });
    } catch (err) {
        console.log("Details Page Error:", err);
        res.status(404).send("Invalid Blog ID");
    }
});

app.get('/edit-blog/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        const result = await Post.findById(id);
        res.render('edit', {blog: result});
    }catch(err){
        console.log(err)
    }
})

// Ye route form se aane wale data ko pakdega aur DB mein update karega
app.post('/update-blog/:id', async (req, res) => {
    const id = req.params.id; // URL se ID nikalna
    
    try {
        // Database mein purane data ko naye data (req.body) se badalna
        await Post.findByIdAndUpdate(id, {
            title: req.body.title, // Form field names schema se match hone chahiye
            snippet: req.body.snippet,
            body: req.body.body,
            author: req.body.author
        });
        
        console.log("Blog successfully update ho gaya!");
        res.redirect('/'); // Update ke baad wapas home page par
    } catch (err) {
        console.log("Update karne mein error aaya:", err);
        res.status(500).send("Update fail ho gaya");
    }
});

app.listen(port, () => {
    console.log(`🚀 Blog Project running on port ${port}`);
});