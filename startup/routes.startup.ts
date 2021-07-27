import ServerClass from "../classes/server.class";
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet';

import error from "../middlewares/error.middleware";
import {logRequest} from "../middlewares/log_request.middleware";
import  {isValidated}  from "../middlewares/validated.middleware";
import {isAuthorized} from "../middlewares/auth.middleware";
import {isAdmin} from "../middlewares/admin.middleware";

import mensajes from "../routes/example.route";
import users from "../routes/user.route";
import users_admin from "../routes/user.admin.route"
import auth from "../routes/auth.route"
import uploads from "../routes/upload.route"
import countries from "../routes/country.route"
import countries_admin from "../routes/country.admin.route"
import communities from "../routes/community.route"
import communities_admin from "../routes/community.admin.route"
import me from "../routes/me.route"
import me_following from "../routes/me.following.route"
import me_follower from "../routes/me.follower.route"
import me_community from "../routes/me.community.route"
import me_token from "../routes/me.token.route"
import me_img from "../routes/me.img.route"
import me_copy from "../routes/me.copy.route"
import genre from "../routes/genre.routes"
import genre_admin from "../routes/genre.admin.route"
import author from "../routes/author.route"
import author_admin from "../routes/author.admin.route"
import vinyl from "../routes/vinyl.route"
import vinyl_admin from "../routes/vinyl.admin.route"
import img from "../routes/img.route"

module.exports = function(server: ServerClass){
    // Helmet
    server.app.use(helmet());

    // BodyParser
    server.app.use( bodyParser.urlencoded({ extended: true}));
    server.app.use(bodyParser.json());

    // CORS
    server.app.use( cors({origin: true, credentials: true }));

    // Routes
    server.app.use('/api/example', mensajes);
    server.app.use('/api/users', [logRequest], users);
    server.app.use('/api/users/admin', [logRequest, isAuthorized, isValidated, isAdmin], users_admin);
    server.app.use('/api/auth', [logRequest], auth);
    server.app.use('/api/uploads', uploads);
    server.app.use('/api/countries', [logRequest, isAuthorized, isValidated] ,countries);
    server.app.use('/api/countries/admin', [logRequest, isAuthorized, isValidated, isAdmin] ,countries_admin);
    server.app.use('/api/communities', [logRequest, isAuthorized, isValidated], communities);
    server.app.use('/api/communities/admin', [logRequest, isAuthorized, isValidated, isAdmin], communities_admin);
    server.app.use('/api/me', [logRequest, isAuthorized, isValidated], me);
    server.app.use('/api/me/following', [logRequest, isAuthorized, isValidated],me_following);
    server.app.use('/api/me/followers', [logRequest, isAuthorized, isValidated], me_follower);
    server.app.use('/api/me/community',[logRequest, isAuthorized, isValidated], me_community);
    server.app.use('/api/me/token',[logRequest, isAuthorized, isValidated], me_token);
    server.app.use('/api/me/img', [logRequest, isAuthorized, isValidated], me_img);
    server.app.use('/api/me/copies', [logRequest, isAuthorized, isValidated], me_copy);
    server.app.use('/api/genres', [logRequest, isAuthorized, isValidated], genre);
    server.app.use('/api/genres/admin', [logRequest, isAuthorized, isValidated, isAdmin], genre_admin);
    server.app.use('/api/authors', [logRequest, isAuthorized, isValidated], author);
    server.app.use('/api/authors/admin', [logRequest, isAuthorized, isValidated, isAdmin], author_admin);
    server.app.use('/api/vinyls', [logRequest, isAuthorized, isValidated], vinyl);
    server.app.use('/api/vinyls/admin', [logRequest, isAuthorized, isValidated, isAdmin], vinyl_admin);


    server.app.use('/api/img', img);

    // Error Middleware
    server.app.use(error);

}
