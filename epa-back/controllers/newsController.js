const { News } = require("../models");

/* ===============================
   CREATE NEWS
================================= */
exports.createNews = async (req, res) => {
    try {
        const { title, news_description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "title is required"
            });
        }

        let file_path = null;
        let file_name = null;

        if (req.file) {
            file_path = `public/news/${req.file.filename}`;
            file_name = req.file.originalname;
        }

        const news = await News.create({
            title,
            news_description,
            file_path,
            file_name,
            created_by: req.user?.user_id || null, // optional if using auth
        });

        return res.status(201).json({
            message: "News created successfully",
            data: news
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


/* ===============================
   GET ALL NEWS
================================= */
exports.getAllNews = async (req, res) => {
    try {
        const newsList = await News.findAll({
            order: [["created_at", "DESC"]],
        });

        return res.status(200).json({
            message: "News list fetched successfully",
            data: newsList
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


/* ===============================
   GET SINGLE NEWS
================================= */
exports.getNews = async (req, res) => {
    try {
        const { news_id } = req.params;

        const news = await News.findByPk(news_id);

        if (!news) {
            return res.status(404).json({
                message: "News not found"
            });
        }

        return res.status(200).json({
            message: "News fetched successfully",
            data: news
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


/* ===============================
   UPDATE NEWS
================================= */
exports.updateNews = async (req, res) => {
    try {
        const { news_id } = req.params;
        const { title, news_description } = req.body;

        const news = await News.findByPk(news_id);

        if (!news) {
            return res.status(404).json({
                message: "News not found"
            });
        }

        let file_path = news.file_path;
        let file_name = news.file_name;

        if (req.file) {
            file_path = `public/news/${req.file.filename}`;
            file_name = req.file.originalname;
        }

        await news.update({
            title: title ?? news.title,
            news_description: news_description ?? news.news_description,
            file_path,
            file_name,
            updated_by: req.user?.user_id || null, // optional
        });

        return res.status(200).json({
            message: "News updated successfully",
            data: news
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


/* ===============================
   DELETE NEWS
================================= */
exports.deleteNews = async (req, res) => {
    try {
        const { news_id } = req.params;

        const news = await News.findByPk(news_id);

        if (!news) {
            return res.status(404).json({
                message: "News not found"
            });
        }

        await news.destroy();

        return res.status(200).json({
            message: "News deleted successfully",
            news_id
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};
