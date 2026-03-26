exports.home = async(req,res) =>{
    res.render("home", {})  
}

exports.about = async(req,res) =>{
    res.render("about", {})
}
