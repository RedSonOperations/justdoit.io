exports.getDate=function(){
    const today=new Date();
    
    const dateOptions={
        weekday: "long",
        day: "numeric",
        month: "long"
    }
    var day=today.toLocaleDateString("en-US", dateOptions);
    return day;
}

exports.getDay=function(){
    const today=new Date();
    
    const dateOptions={
        weekday: "long",
    }
    var day=today.toLocaleDateString("en-US", dateOptions);
    return day;
}