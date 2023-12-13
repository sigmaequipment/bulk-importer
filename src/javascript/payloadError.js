module.exports = class PayloadError{
    constructor(sku,ErrorMessage,FailedAt){
        this.Sku = sku;
        this.ErrorMessages = ErrorMessage;
        this.FailedAt = FailedAt;
    }
}