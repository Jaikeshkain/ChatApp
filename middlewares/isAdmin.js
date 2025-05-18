const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      return next();
    } else {
      return res.status(203).json({ message: "Not authorized admin only",data:null });
    }
  } catch (error) {
    res.status(500).json({ message: error.message,data:null });
  }
};

module.exports=isAdmin