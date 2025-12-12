
export class Member {
    _id : string
    username : string
    password:string
    actif : Boolean
    isAdmin : Boolean
    notification : Boolean
    isPasswordChanged : Boolean

  
    constructor(id: string, username: string, password: string, actif: Boolean, isAdmin:Boolean,notification:Boolean,isPasswordChanged : Boolean) {
      this._id = id;
      this.username = username;
      this.password = password;
      this.actif=actif;
      this.isAdmin=isAdmin     
      this.notification=notification
      this.isPasswordChanged = isPasswordChanged
    }
  
  }