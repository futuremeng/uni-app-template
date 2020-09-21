let url_config = ""

if(process.env.NODE_ENV === 'development'){
    // 开发环境
    url_config = 'http://api.local.ecenc.com/'
}else{
    // 生产环境
    url_config = 'https://api.ecenc.com/'
}

export default url_config