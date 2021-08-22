import md5 from 'md5'

export default (gin: number):string => {
    const hash1 = md5(gin.toString(16))
    const hash2 = md5('sakura' + hash1)
    const hash3 = md5('cM0&#fpZYqIUED9krfG7' + hash1 + 'Jo@4lDIIo4AimaPeA9Yn' + hash2)
    return md5(hash3)
}
