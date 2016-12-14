"use strict";
var Router = require('koa-router'),
  mount = require('koa-mount'),
  users = require('./controllers/users'),
  usersSettings = require('./controllers/usersSettings'),
  usersSocialNetworks = require('./controllers/usersSocialNetworks'),
  usersTeams = require('./controllers/usersTeams'),
  publicController = require('./controllers/public'),
  auth = require('./controllers/authentication'),
  perm = require('./controllers/permissions'),
  files = require('./controllers/files'),
  emails = require('./controllers/emails'),
  chat = require('./controllers/chat'),
  endpointCache = require('./controllers/endpointCache'),
  publisher = require('./controllers/publisher'),
  monitoring = require('./controllers/monitoring'),
  customerCare = require('./controllers/customerCare'),
  render = require('./render');

var version = 'v1';

var publicRouter = new Router({prefix: '/' + version});
var secured = new Router({prefix: '/' + version});
var payed = new Router({prefix: '/' + version});

/**
 *  PUBLIC ROUTES
 */
publicRouter
  .get('/', publicController.blank)
  .post('/register-version/:provider', publicController.frontendVersionHook, render)
  .get('/proxy', files.proxy)
  .get('/link-preview', files.linkPreview, render)
  .get('/chat/routes', chat.chatRoutes, render)
  .post('/users/:userId/networks/:networkId/notifications/:type', perm.isWhiteListed, usersSocialNetworks.sendExpirationNotification, render)
  .get('/users-paying', perm.isWhiteListed, users.getUserPaying, render)
  .del('/cache/user/:userId/flush/', perm.isWhiteListed, endpointCache.flushUser, render)
  .del('/cache/team/:masterId/flush/', perm.isWhiteListed, endpointCache.flushTeam, render)
  .get('/monitoring/accepted-languages/', perm.isWhiteListed, monitoring.getAcceptedLanguages)
  .post('/contact-form', emails.contactForm, render)
  .post('/sign-up', auth.signUp, render)
  .post('/forgotten-password', auth.forgottenPassword, render)
  .post('/auth/zoomsphere', auth.zoomsphereCallback, auth.loginZoomSphere, render)
  .get('/auth/facebook', auth.facebookRequest, render)
  .get('/auth/facebook/callback', auth.facebookCodeCallback, auth.loginZoomSphere, render)
  .post('/auth/facebook/callback', auth.facebookCallback, auth.loginOrSignUpSocial, render)
  .get('/auth/twitter', auth.twitterRequest, render)
  .get('/auth/twitter/callback', auth.twitterCallback, auth.loginOrSignUpSocial, render)
  .post('/auth/token', auth.tokenCallback, render)
  .post('/auth/validate', auth.validateToken, auth.loginZoomSphere, render)
  .get('/auth/google', auth.googleRequest, render)
  .get('/auth/google/callback', auth.googleCallback, auth.loginOrSignUpSocial, render)
  .get('/auth/linkedin/callback', auth.linkedinCallback, render)
  .get('/auth/youtube/callback', auth.youtubeCallback)
  .get('/auth/instagram/callback', auth.instagramCallback, render);

module.exports.public = publicRouter;


/**
 * AUTHENTICATOR
 * @type {Auth.isAuthenticated}
 */
module.exports.isAuthenticated = [
  mount('/' + version, auth.isAuthenticated),
  mount('/' + version, endpointCache.onChangeFlushTeamCache),
  mount('/' + version, endpointCache.saveResult)];
/**
 * SECURED ROUTES
 */
secured
  .get('/localize-me', publicController.localizeMe, render)
  .post('/files/upload', files.upload, render)
  .post('/upload/file', files.upload, render)
  .post('/upload/profile-picture', files.profilePicture, files.upload, render)
  .post('/upload/chat-file', files.chatFiles, files.upload, render)
  .post('/upload/module-background', files.moduleBackground, files.upload, render)
  .get('/users/:userId', perm.isOwnerOrMasterOrRoot, users.detail, render)
  .get('/users/me', users.me, users.detail, render);

module.exports.secured = secured;

module.exports.isPayed = mount('/' + version, perm.isPayed);
/**
 * PAYED ROUTES - available only for non expired accounts
 */
payed
  .post('/chat/start', chat.start, render)
  .post('/chat/channels', chat.createChannel, render)
  .post('/chat/login', perm.isRoot, chat.login, render)
  .post('/chat/channels/:channelId/invite', chat.inviteToChannel, render)
  .post('/chat/channels/:channelId/join', chat.joinChannel, render)
  .post('/chat/channels/:channelId/leave', chat.leaveChannel, render)
  .get('/chat/channels/:channelId/history/:ts', chat.messageHistory, render)
  .post('/chat/im', chat.createIM, render)
  .get('/chat/im/:channelId/history/:ts', chat.messageHistory, render)
  .get('/chat/team', usersTeams.listMyTeammates, render)
  .post('/publisher/:moduleId/list-posts', publisher.listPosts, render)
  .get('/connected-profiles', usersSocialNetworks.listMyAccounts, render)
  .post('/external-profile', usersSocialNetworks.getExternalProfile, render)
  .put('/users/:userId', perm.isOwner, users.update, render)
  .put('/users/:userId/activate', perm.isOwner, users.activate, render)
  .post('/users', users.create, render)
  .post('/users/find', perm.isRoot, users.findUser, render)
  .post('/users/:userId/switch/:teammateId', perm.isMasterOrRoot, users.switch, auth.loginZoomSphere, render)
  .get('/users/:userId/clients/', perm.isRoot, users.getMyClients, render)
  .post('/users/:userId/clients/', perm.isRoot, users.addMyClient, render)
  .post('/users/:userId/tariff/', perm.isRoot, users.changeTariff, render)
  .put('/users/:userId/demo', perm.isRoot, users.setTrial, render)
  .del('/users/:userId/clients/:clientId', perm.isRoot, users.deleteMyClient, render)
  .get('/users/:userId/publisher-labels', perm.isOwner, publisher.listUserLabels, render)
  .get('/users/:userId/customer-care-labels', perm.isOwner, publisher.listAllLabels, render)
  .get('/users/:userId/workspaces/:workspaceId/publisher-labels', perm.isOwner, publisher.listPublisherLabels, render)
  .get('/users/:userId/workspaces/:workspaceId/modules', perm.isOwner, users.getWorkspaceModules, render)
  .post('/users/:userId/workspaces/:workspaceId/modules/sort', perm.isOwner, users.sortModules, users.getWorkspaceModules, render)
  .get('/users/:userId/workspaces/:workspaceId/publisher-statuses', perm.isOwner, publisher.listStatuses, render)
  .get('/users/:userId/publisher-statuses', perm.isOwner, publisher.publisherStatuses, render)
  .get('/users/:userId/workspaces/:workspaceId/customer-care-statuses', perm.isOwner, customerCare.listCustomerStatuses, render)
  .get('/users/:userId/customer-care-statuses',  perm.isOwner, customerCare.CustomerStatuses, render )
  .get('/users/:userId/crm-tags', perm.isOwner, customerCare.listCRMTags, render)
  .get('/users/:userId/workspaces/:workspaceId/customer-care-tags', perm.isOwner, customerCare.listTags, render)
  .get('/users/:userId/workspaces/:workspaceId/customer-care-labels', perm.isOwner, customerCare.listLabels, render)
  .get('/users/:userId/modules/:moduleId', perm.isOwner, users.getModule, render)
  .put('/users/:userId/modules/:moduleId', perm.isOwner, users.updateModule, users.getModule, render)
  .del('/users/:userId/workspaces/:workspaceId/customer-care-labels/:labelId', perm.isMaster, customerCare.removeLabel, render)
  .del('/users/:userId/workspaces/:workspaceId/publisher-labels/:labelId', perm.isMaster, publisher.removeLabel, render)
  .del('/users/:userId/workspaces/:workspaceId/customer-care-statuses/:statusId', perm.isMaster, customerCare.removeStatus, render)
  .put('/modules', users.createModule, render) /** deprecated */
  .post('/modules', users.createModule, render)
  .get('/modules/languages', users.listModulesQueryLanguages, render)
  .get('/users/settings/businessHours', usersSettings.getBusinessHours, render)
  .get('/users/settings/emailFooter', perm.isMaster, usersSettings.getEmailFooter, render)
  .get('/users/:userId/modules', perm.isOwner, users.listModules, render)
  .del('/users/:userId', perm.isOwner, users.delete, render)
  .get('/users/:userId/advancedSettings', perm.isMaster, usersSettings.getWorkspacesSettings, usersSettings.getAdvancedSettings, render)
  .post('/users/:userId/advancedSettings/workspaces', perm.isMaster, usersSettings.createWorkspace, usersSettings.getWorkspacesSettings, usersSettings.getAdvancedSettings, render)
  .put('/users/:userId/advancedSettings/workspaces/:workspaceId', perm.isMaster, usersSettings.saveWorkspace, usersSettings.getWorkspacesSettings, usersSettings.getAdvancedSettings, render)
  .del('/users/:userId/advancedSettings/workspaces/:workspaceId', perm.isMaster, usersSettings.deleteWorkspace, usersSettings.getWorkspacesSettings, usersSettings.getAdvancedSettings, render)
  .put('/users/:userId/advancedSettings/businessHours', perm.isMaster, usersSettings.saveBusinessHours, usersSettings.getWorkspacesSettings, usersSettings.getAdvancedSettings, render)
  .put('/users/:userId/advancedSettings/emailFooter', perm.isMaster, usersSettings.saveEmailSettings, usersSettings.getWorkspacesSettings, usersSettings.getAdvancedSettings, render)
  .get('/users/:userId/networks', perm.isMaster, usersSocialNetworks.list, render)
  .post('/users/:userId/networks/:networkId/accounts/:accountId/pages', perm.isMaster, usersSocialNetworks.addPage, usersSocialNetworks.list, render)
  .put('/users/:userId/networks/facebook/accounts/:accountId/pages', perm.isMaster, usersSocialNetworks.refreshFBpages, render)
  .put('/users/:userId/networks/facebook/accounts/:accountId/pages/:pageId/change-account', perm.isMaster, usersSocialNetworks.changeFBpageAccount, usersSocialNetworks.list, render)
  .get('/users/:userId/networks/:networkId/accounts/:accountId/pages', perm.isMaster, usersSocialNetworks.getPages, render)
  .del('/users/:userId/networks/:networkId/accounts/:accountId', perm.isMaster, usersSocialNetworks.deleteAccount, render)
  .del('/users/:userId/networks/:networkId/pages/:pageId', perm.isMaster, usersSocialNetworks.deletePage, render)
  .get('/users/:userId/networks/validate-accounts', perm.isMaster, usersSocialNetworks.validateAccountsTokens, render)
  .post('/users/:userId/networks/facebook/accounts', perm.isMaster, usersSocialNetworks.addFacebookAccount, render)
  .get('/users/:userId/networks/instagram/accounts', perm.isMaster, auth.instagramRequest, endpointCache.flushTeamCache, render)
  .get('/users/:userId/networks/linkedin/accounts', perm.isMaster, auth.linkedinRequest, endpointCache.flushTeamCache, render)
  .get('/users/:userId/networks/twitter/accounts', perm.isMaster, auth.twitterRequest, endpointCache.flushTeamCache, render)
  .get('/users/:userId/networks/google/accounts', perm.isMaster, auth.googleRequest, endpointCache.flushTeamCache, render)
  .get('/users/:userId/networks/youtube/accounts', perm.isMaster, auth.youtubeRequest, endpointCache.flushTeamCache, render)
  .put('/users/:userId/networks/email/:emailId', perm.isMaster, usersSocialNetworks.saveEmailSettings, render)
  .del('/users/:userId/networks/email/:emailId', perm.isMaster, usersSocialNetworks.deleteEmailSettings, render)
  .post('/users/:userId/networks/email', perm.isMaster, usersSocialNetworks.saveEmailSettings, render)
  .post('/users/:userId/sendValidation', perm.isOwner, users.sendEmailValidation, render)
  .get('/users/:userId/teammates', perm.isOwnerOrMasterOrRoot, usersTeams.list, render)
  .get('/users/teammates/workspaces/:workspaceId', usersTeams.listTeammatesInWorkspace, render)
  .post('/users/:userId/teammates', perm.isMaster, usersTeams.createUser, usersTeams.list, render)
  .put('/users/:userId/teammates/:teammateId', perm.isMaster, usersTeams.updateUser, usersTeams.list, render)
  .get('/users/:userId/teammates/:teammateId/invitations', perm.isMaster, usersTeams.getInvitation, render)
  .post('/users/:userId/teammates/:teammateId/invitations', perm.isMaster, usersTeams.sendInvitation, render)
  .put('/users/:userId/teammates/:teammateId/invitations', perm.isMaster, usersTeams.saveTemplate, render)
  .get('/users/:userId/teammates/:teammateId/permissions', perm.isMaster, usersTeams.getPermissions, render)
  .put('/users/:userId/teammates/:teammateId/permissions', perm.isMaster, usersTeams.savePermissions, usersTeams.getPermissions, render)
  .get('/users/:userId/teammates/:teammateId/modules', perm.isMaster, usersTeams.getModules, render)
  .put('/users/:userId/teammates/:teammateId/modules', perm.isMaster, usersTeams.saveModules, usersTeams.getModules, render)
  .post('/monitoring/search', monitoring.search)
  .post('/monitoring/validate-query', monitoring.validateSearchQuery, render)
  .del('/users/:userId/teammates/:teammateId', perm.isMaster, usersTeams.delete, render);

module.exports.payed = payed;