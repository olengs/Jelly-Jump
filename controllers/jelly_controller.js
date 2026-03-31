const jellyModel = require("../models/jelly-model")

exports.showJellies = async(req,res) =>{
    try{
        const jellyData = await jellyModel.getjellyplayerId(req.session.user._id)
        return res.render('jelly',{jellyData, error:''})
    }catch(error){
        res.send('cannot jellies ')
    }
}
    