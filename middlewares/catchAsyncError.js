

// export const catchAsyncError = () =>{
//     return()=>{

//     }
// }

// Upper is also similar to next syntax

export const catchAsyncError = (passedFunction) => (req,res,next)=>{
    Promise.resolve(passedFunction(req,res,next).catch(next));
};