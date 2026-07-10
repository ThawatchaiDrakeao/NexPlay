const { checkDatabaseHealth } = require('../services/healthService');


const getHealth = async (req,res)=>{
  try {

    const database = await checkDatabaseHealth();

    res.status(200).json({
      status:'ok',
      service:'nexplay-api',
      database
    });


  } catch(error){

    res.status(503).json({
      status:'error',
      message:error.message
    });

  }
};


module.exports = {
  getHealth
};