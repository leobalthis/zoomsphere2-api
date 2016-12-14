'use strict';

var sequelize = require('sequelize'),
  sha1 = require('sha1'),
  moment = require('moment'),
  _ = require('lodash'),
  db = require(__dirname + '/../../../services').db,
  Replace = require(__dirname + '/../helpers/replace');
var UserSchema = db.import(__dirname + '/../schemas/user');
var UserAdminSchema = db.import(__dirname + '/../schemas/user_admin_ids');

class UsersModel {

  static * getDetailPublic(id) {
    let user = yield UserSchema.findOne({where: {id: id}});
    let master = yield UsersModel.addMaster(user);
    return UsersModel.parsePublic(user, master)
  }

  static * addMaster(user) {
    let masterId = yield user.getMasterUser();
    let master = user;
    if (masterId[0]) {
      user.masterId = masterId[0].from_user_id;
      master = yield UsersModel.getDetailPrivate(masterId[0].from_user_id);
    } else {
      user.masterId = user.id;
    }
    user.permissions = {
      tariff: UsersModel.getTariff(master.demo, master.tariff, master.date_paid)
    };
    return master;
  }

  static * validateEmail(hash) {
    let user = yield UserSchema.findOne({where: {hash: hash}});
    if (user) {
      if (user.state === this.STATES.DELETED) {
        return false;
      }
      if (hash.length === 9) {
        user.state = UsersModel.STATES.FORGOTTEN_PASSWORD;
      } else {
        user.state = this.STATES.COMPLETED;
      }
      user.hash = null;
      user.save();
      return user.id;
    }
    return false;
  }

  static * listMyClients(id) {
    let clients = yield db.query(
      'SELECT u.id, IFNULL(a.name, u.name) fullName, u.date_logged, u.image_square, IF(ISNULL(master.id), u.date_paid, master.date_paid) date_paid, IF(ISNULL(master.id), u.demo, master.demo) demo, IF(ISNULL(master.id), u.tariff, master.tariff) tariff'
      + ' FROM user_admin_ids a'
      + ' JOIN user u ON a.to_user_id=u.id'
      + ' LEFT JOIN share_user s ON u.id = s.to_user_id'
      + ' LEFT JOIN user master ON s.from_user_id = master.id'
      + ' WHERE a.from_user_id = $id ORDER BY fullName ASC', {
        bind: {id: id},
        type: sequelize.QueryTypes.SELECT
      });
    return clients.map((client) => {
      client.image_square = Replace.replaceHttp(client.image_square);
      client.tariff = this.getTariff(client.demo, client.tariff, client.date_paid);
      client.date_paid = client.tariff == this.TARIFFS.PROFESSIONAL ? client.date_paid : client.demo;
      delete client.demo;

      return client;
    });
  }

  static * addMyClient(myId, clientId, name) {
    yield UserAdminSchema.create({from_user_id: myId, to_user_id: clientId, name: name || null});
    return yield this.listMyClients(myId);
  }

  static * deleteMyClient(myId, clientId) {
    yield UserAdminSchema.destroy({where: {from_user_id: myId, to_user_id: clientId}});
    return yield this.listMyClients(myId);
  }

  static * getDetailPrivate(id) {
    return yield UserSchema.findOne({where: {id: id}});
  }

  static * getDetailPrivateByApitoken(apitoken) {
    let user = yield UserSchema.findOne({where: {apitoken: apitoken}});
    if (!user) {
      return user;
    }
    return {user: user, master: yield UsersModel.addMaster(user)}
  }

  static *  getDetailByEmail(email) {
    return yield UserSchema.findOne({where: {email: email}})
  }

  static * getMention(userId) {
    let username = yield UserSchema.findOne({attributes: ['name'], where: {id: userId}});
    return username ? `<@${userId}|${username.name}>` : `<@${userId}>`;
  }

  static *  getDetailByEmailAndPasswordPrivate(email, password) {
    return yield UserSchema.findOne({where: {email: email, password: sha1(password)}})
  }

  static *  getDetailByEmailOrUsernameAndPasswordPrivate(email, password) {
    return yield UserSchema.findOne({where: {$or: [{email: email}, {nick: email}], password: sha1(password)}})
  }

  static * buildUser(account, state, fullname, password, email, account_id, image, company, position) {
    if (password != null) {
      password = sha1(password);
    }
    let logged, demo;
    if (state === this.STATES.TEMPORARY) {
      logged = null;
      demo = null;
    } else {
      logged = sequelize.fn('now');
      demo = moment().add(7, 'days');
    }
    let user = {
      name: fullname,
      password: password,
      email: email,
      state: state,
      account: account,
      account_id: account_id,
      company: company,
      position: position,
      date_logged: logged,
      date_registered: sequelize.fn('now'),
      demo: demo
    };
    if (image) {
      user.image_big = image;
      user.image_square = image;
    }
    return yield UserSchema.create(user);
  }

  static * findOrCreateUser(account_type, fullname, account_id, image, email) {
    var state = this.STATES.UNCOMPLETED;
    let user = yield UserSchema.findOne({where: {account_id: account_id, account: account_type}});
    if (email == null) {
      if (!user) {
        user = yield UsersModel.buildUser(account_type, state, fullname, null, email, account_id, image);
      }
    } else {
      if (!user) {
        user = yield UserSchema.findOne({where: {email: email}});
      }
      if (!user) {
        user = yield UsersModel.buildUser(account_type, state, fullname, null, email, account_id, image);
      } else {
        switch (user.state) {
          case this.STATES.UNCOMPLETED:
            user.account = account_type;
            user.account_id = account_id;
            user.state = this.STATES.UNCOMPLETED;
            user.password = null;
            user = yield user.save();
            break;
          case this.STATES.UNCONFIRMED:
            user.state = this.STATES.COMPLETED;
            user = yield user.save();
            break;
        }
      }
    }
    return user[0] || user;
  }

  static * saveUser(user) {
    if (arguments[1]) {
      if (arguments[1].password !== undefined) {
        if (arguments[1].password == '' || user.account !== this.ACCOUNTS.ZOOMSPHERE) {
          delete arguments[1].password
        } else {
          arguments[1].password = sha1(arguments[1].password)
        }
      }
      if (arguments[1].email && user.email != null) {
        delete arguments[1].email;
      }
      Object.assign(user, composeParams(arguments[1]))
    }
    return yield user.save()
  }

  static * saveRawUser(user, newData) {
    Object.assign(user, composeParams(newData));
    return yield user.save()
  }

  static * delete(user) {
    return yield this.saveUser(user, {state: this.STATES.DELETED, apitoken: null});
  }

  static * setTariff(userId, date) {
    let user = yield UsersModel.getDetailPrivate(userId);
    if (moment().diff(moment(date)) < 0) {
      user.date_paid = moment(date);
      user.tariff = this.TARIFFS.PROFESSIONAL;
    } else {
      user.date_paid = new Date();
      user.tariff = this.TARIFFS.EXPIRED;
    }
    yield user.save();
  }

  static getTariff(demo, tariff, datePaid) {
    let now = moment();
    if (tariff == this.TARIFFS.PROFESSIONAL && now.diff(moment(datePaid)) < 0) {
      return this.TARIFFS.PROFESSIONAL;
    } else if (now.diff(moment(demo)) < 0) {
      return this.TARIFFS.DEMO;
    } else {
      return this.TARIFFS.EXPIRED;
    }
  }

  static * updateTrialAccount(userId, demo) {
    let user = yield UsersModel.getDetailPrivate(userId);
    user.demo = demo;
    return yield user.save();
  }

  static parsePublic(user, master) {
    let defVal = user.id == master.id;
    let defaultModules = {crm: defVal, report: defVal, create_module: defVal};
    let userInfo = {};
    try {
      userInfo = JSON.parse(user.userInfo) || {};
    } catch (err) {
      console.error(err);
    }

    let modules = defaultModules;
    if (userInfo.modules) {
      modules = _.mapValues(userInfo.modules, (mod) => {
        return !!mod;
      });
    }

    user.image_big = Replace.replaceHttp(user.image_big);
    user.image_square = Replace.replaceHttp(user.image_square);
    let tariff = UsersModel.getTariff(master.demo, master.tariff, master.date_paid);
    let data = {
      id: user.id,
      fullName: user.name,
      email: user.email || '',
      country: user.country || '',
      timezone: user.timezone || '',
      about: user.about || '',
      signature: user.signature || '',
      company: user.company || '',
      position: user.position || '',
      image_big: user.image_big || '',
      image_square: user.image_square || '',
      state: user.state,
      account: user.account,
      date_registered: user.date_registered,
      date_logged: user.date_logged,
      date_paid: tariff == this.TARIFFS.PROFESSIONAL ? user.date_paid : user.demo,
      masterId: user.masterId,
      role: user.role,
      tariff: tariff,
      modules: modules
    };

    /** HACK for /users/find */
    if (user.masterName) {
      data.masterName = user.masterName
    }
    if (user.masterCompany) {
      data.masterCompany = user.masterCompany
    }
    return data;
  }

  static * listUserPaying() {
    let firstArray = yield db.query(
      'SELECT s.to_user_id as id'
      + ' FROM user u'
      + ' JOIN share_user s ON u.id=s.from_user_id'
      + ' WHERE (u.tariff = "' + UsersModel.TARIFFS.PROFESSIONAL + '" AND u.date_paid > NOW()) OR u.demo > NOW()', {
        type: sequelize.QueryTypes.SELECT
      });

    let secondArray = yield UserSchema.findAll({
      attributes: ['id'],
      where: {
        $or: [
          {$and: [{tariff: {$eq: UsersModel.TARIFFS.PROFESSIONAL}}, {date_paid: {gt: Date.now()}}]},
          {demo: {gt: Date.now()}}
        ]
      }
    });
    return secondArray.concat(firstArray);
  }

  static * findUser(options) {
    let where = [];
    if (options.query) {
      if (options.query == Number(options.query)) {
        where.push('(u.id = :query)')
      } else {
        options.query = '%' + options.query + '%';
        where.push('(u.name LIKE :query OR u.nick LIKE :query OR u.email LIKE :query)')
      }
    }
    if (options.type !== 'all') {
      let innerWhere;
      switch (options.type) {
        case 'valid':
          innerWhere = '((u.tariff = "' + UsersModel.TARIFFS.PROFESSIONAL + '" AND u.date_paid > NOW()) OR u.demo > NOW())';
          break;
        case 'expired':
          innerWhere = '(u.tariff = "' + UsersModel.TARIFFS.EXPIRED + '" OR u.demo < NOW())';
          break;
        case 'demo':
          innerWhere = 'u.demo > NOW()';
          break;
        case 'payment':
          innerWhere = 'u.tariff = "' + UsersModel.TARIFFS.PROFESSIONAL + '" AND u.date_paid > NOW()';
          break;
      }
      if (options.master_only) {
        where.push(innerWhere)
      } else {
        where.push('u.id in (' +
          ' SELECT to_user_id id FROM share_user s JOIN user u ON u.id=s.from_user_id WHERE ' + innerWhere +
          ' UNION ' +
          ' SELECT id FROM user u WHERE ' + innerWhere + ' )')
      }
    } else {
      if (options.master_only) {
        where.push('u.id IN (SELECT from_user_id id FROM share_user GROUP BY from_user_id)')
      }
    }
    if (options.country) {
      where.push('u.country = :country');
    }
    options.order = 'u.' + options.order.split('-').join(' ');

    let users = yield db.query(
      'SELECT u.*, ' +
      ' IFNULL(m.id, u.id) masterId, ' +
      ' m.name masterName, ' +
      ' m.company masterCompany, ' +
      ' IFNULL(m.demo, u.demo) masterDemo, ' +
      ' IFNULL(m.tariff, u.tariff) masterTariff, ' +
      ' IFNULL(m.date_paid, u.date_paid) masterDatePaid, ' +
      ' (SELECT COUNT(1) FROM user_facebook_page WHERE user_id = u.id) facebook, ' +
      ' (SELECT COUNT(1) FROM user_account WHERE user_id = u.id AND account = "twitter") twitter' +
      ' FROM user u' +
      ' LEFT JOIN share_user s ON u.id = s.to_user_id' +
      ' LEFT JOIN user m ON s.from_user_id=m.id ' +
      (where.length > 0 ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY ' + options.order + ' LIMIT :limit OFFSET :from', {
        type: sequelize.QueryTypes.SELECT,
        replacements: options
      });

    if (users.length == 0) {
      return []
    }
    let modules = yield db.query('SELECT user_id, module, count(1) count FROM ec_module WHERE id IN (:ids) GROUP BY module, user_id', {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        ids: users.map((user) => {
          return user.id
        })
      }
    });
    let wss = yield db.query(
      'SELECT COUNT(1) count, user_id FROM' +
      ' ((SELECT m.workspace_id, to_user_id user_id FROM share_ec_module sm JOIN ec_module m ON m.id = sm.ec_module_id WHERE to_user_id IN (:ids) GROUP BY m.workspace_id, to_user_id)' +
      ' UNION' +
      ' (SELECT workspace_id, user_id FROM ec_module WHERE user_id IN (:ids))) tab GROUP BY user_id'
      , {
        replacements: {
          ids: users.map((user) => {
            return user.id
          })
        },
        type: sequelize.QueryTypes.SELECT
      });

    return users.map((user) => {
      let userModules = {total: 0};
      modules.forEach((module)=> {
        if (module.user_id === user.id) {
          userModules[module.module] = module.count;
          userModules.total = userModules.total + module.count;
        }
      });
      let wsCount = 0;
      wss.forEach((ws) => {
        if (ws.user_id === user.id) {
          wsCount = ws.count;
        }
      });
      return {
        user: UsersModel.parsePublic(user, {id: user.masterId, demo: user.masterDemo, tariff: user.masterTariff, date_paid: user.masterDatePaid}),
        statistics: {
          modules: userModules,
          social: {facebook: user.facebook, twitter: user.twitter}
        },
        workspaces: wsCount
      }
    })
  }
}
UsersModel.STATES = {
  DELETED: 'deleted',
  UNCOMPLETED: 'uncompleted',
  UNCONFIRMED: 'unconfirmed email',
  COMPLETED: 'completed',
  TEMPORARY: 'temporary',
  FORGOTTEN_PASSWORD: 'forgotten_password'
};
UsersModel.ACCOUNTS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  ZOOMSPHERE: 'zoomsphere',
  GOOGLE: 'google'
};
UsersModel.TARIFFS = {
  DEMO: 'demo',
  PROFESSIONAL: 'profi',
  EXPIRED: 'expired'
};
module.exports = UsersModel;

var parameters = {
  fullName: 'name',
  password: 'password',
  timezone: 'timezone',
  email: 'email',
  about: 'about',
  signature: 'signature',
  company: 'company',
  position: 'position',
  image_big: 'image_big',
  image_square: 'image_square',
  country: 'country',
  state: 'state',
  hash: 'hash',
  role: 'role',
  teammateId: 'id'
};

function composeParams(args) {
  var ret = {};
  var params = Object.keys(parameters);
  _.forIn(args, function (value, key) {
    if (params.indexOf(key) !== -1) {
      ret[parameters[key]] = value;
    }
  });
  return ret
}
