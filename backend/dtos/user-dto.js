/*
options

0 - nobody
1 - everybody
2 - friends only

*/

class UserDto {
  constructor(model) {
    this._id = model._id;
    this.email = model.email;
    this.username = model.username;
    this.password = model.password;
    this.status = model.status;
    this.isverified = model.isverified;
    this.token = model.token;
    this.avatar = model.avatar;
    this.firstname = model.firstname;
    this.lastname = model.lastname;
    this.followingCommunitiesCount = model.followingCommunitiesCount;
    this.info = {...model.info};
    this.options = {...model.options};
  }

  commonInfo() {
    return {
      _id: this._id,
      username: this.username,
      status: this.status,
      avatar: this.avatar,
      firstname: this.firstname,
      lastname: this.lastname,
      followingCommunitiesCount: this.followingCommunitiesCount
    };
  }

  fullInfo(infoOptions = { birthday: true, hometown: true, gender: true }) {
    const aboutInfo = {};
    for (const key in infoOptions) {
      if (infoOptions[key]) {
        aboutInfo[key] = this.info[key];
      }
    }

    return {
      _id: this._id,
      username: this.username,
      status: this.status,
      avatar: this.avatar,
      firstname: this.firstname,
      lastname: this.lastname,
      followingCommunitiesCount: this.followingCommunitiesCount,
      info: aboutInfo
    };
  }

  getInfoOptions(isFriend = false) {
    const infoOptions = {};
    for (const key in this.options) {
      if (this.options[key] == 1) {
        infoOptions[key] = true;
      } else if (this.options[key] == 2 && isFriend) {
        infoOptions[key] = true;
      } else {
        infoOptions[key] = false;
      }
    }
    return infoOptions;
  }
}

module.exports = UserDto;
