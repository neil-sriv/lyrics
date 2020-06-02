import * as AuthSession from 'expo-auth-session';
import { spotifyCredentials } from './secrets';
import { encode as btoa } from 'base-64';
import { AsyncStorage } from 'react-native';

export default class Auth {
	constructor() {
		this.scopesArr = [
			'user-modify-playback-state',
			'user-read-currently-playing',
			'user-read-playback-state',
			'user-library-modify',
			'user-library-read',
			'playlist-read-private',
			'playlist-read-collaborative',
			'playlist-modify-public',
			'playlist-modify-private',
			'user-read-recently-played',
			'user-top-read',
		];
		this._scopes = this.scopesArr.join(' ');
	}

	async getAuthorizationCode() {
		// 	const redirectUrl = AuthSession.getRedirectUrl();
		// console.log(
		// 	'https://accounts.spotify.com/authorize' +
		// 		'?response_type=code' +
		// 		'&client_id=' +
		// 		spotifyCredentials.clientId +
		// 		(this._scopes ? '&scope=' + encodeURIComponent(this._scopes) : '') +
		// 		'&redirect_uri=' +
		// 		encodeURIComponent(redirectUrl)
		// );
		try {
			const redirectUrl = AuthSession.getRedirectUrl();
			const result = await AuthSession.startAsync({
				authUrl:
					'https://accounts.spotify.com/authorize' +
					'?response_type=code' +
					'&client_id=' +
					spotifyCredentials.clientId +
					(this._scopes ? '&scope=' + encodeURIComponent(this._scopes) : '') +
					'&redirect_uri=' +
					encodeURIComponent(redirectUrl) +
					'&show_dialog=true',
				// 			authUrl: `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyCredentials.client_id}
				// &redirect_uri=${encodeURIComponent(redirectUrl)}
				// &scope=${encodeURIComponent('user-read-email&response_type=token')}`,
			});
			console.log(result);
			if (result.type == 'cancel') {
				return '';
			}
			return result.params.code;
		} catch (err) {
			console.error(err);
		}
	}

	async storeTokens() {
		try {
			const auth_code = await this.getAuthorizationCode();
			if (auth_code == '') {
				return 'error';
			}
			const credsB64 = btoa(
				`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`
			);
			const response = await fetch('https://accounts.spotify.com/api/token', {
				method: 'POST',
				headers: {
					Authorization: `Basic ${credsB64}`,
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/json',
				},
				body: `grant_type=authorization_code&code=${auth_code}&redirect_uri=${spotifyCredentials.redirectUri}`,
			});
			const responseJson = await response.json();
			const {
				access_token: accessToken,
				refresh_token: refreshToken,
				expires_in: expiresIn,
			} = responseJson;
			const expirationTime = new Date().getTime() + expiresIn * 1000;
			await this.setUserData('accessToken', accessToken);
			await this.setUserData('refreshToken', refreshToken);
			await this.setUserData('expirationTime', expirationTime);
			return 'success';
		} catch (err) {
			console.error(err);
		}
	}

	async useRefreshToken() {
		try {
			const refreshToken = await this.getUserData('refreshToken');
			var trimmedToken;
			if (refreshToken) {
				trimmedToken = refreshToken.substring(1, refreshToken.length - 1);
			}
			else {
				trimmedToken = ''
			}
			const credsB64 = btoa(
				`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`
			);
			const response = await fetch('https://accounts.spotify.com/api/token', {
				method: 'POST',
				headers: {
					Authorization: `Basic ${credsB64}`,
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/json',
				},
				body: `grant_type=refresh_token&refresh_token=${trimmedToken}`,
			});
			const responseJson = await response.json();
			if (responseJson.error) {
				console.log('refresh token failed');
				const res = await this.storeTokens();
				return res;
			} else {
				console.log('refresh token succeeded');
				const {
					access_token: newAccessToken,
					refresh_token: newRefreshToken,
					expires_in: expiresIn,
				} = responseJson;

				const expirationTime = new Date().getTime() + expiresIn * 1000;
				await this.setUserData('accessToken', newAccessToken);
				await this.setUserData('expirationTime', expirationTime);
				if (newRefreshToken) {
					await this.setUserData('refreshToken', newRefreshToken);
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	async storeUser() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch('https://api.spotify.com/v1/me', {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + trimmedToken },
			});
			if (response.status == 200){
				const responseJson = await response.json();
				await this.setUserData('user', responseJson)
				return responseJson;
			}
		} catch (err) {
			console.error(err);
		}
	}

	async storeTopArtists() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=3', {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + trimmedToken },
			});
			if (response.status == 200){
				const responseJson = await response.json();
				await this.setUserData('artists', responseJson)
				return responseJson;
			}
		} catch (err) {
			console.error(err);
		}
	}

	async storeTopTracks() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=3', {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + trimmedToken },
			});
			if (response.status == 200){
				const responseJson = await response.json();
				await this.setUserData('tracks', responseJson)
				return responseJson;
			}
		} catch (err) {
			console.error(err);
		}
	}

	async playbackState() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch('https://api.spotify.com/v1/me/player', {
				method: 'GET',
				headers: {
					Authorization: 'Bearer ' + trimmedToken,
				},
			});
			if (response.status == 200) {
				const responseJson = await response.json();
				return responseJson;
			}
		} catch (err) {
			console.error(err);
		}
	}

	async pause() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch(
				'https://api.spotify.com/v1/me/player/pause',
				{
					method: 'PUT',
					headers: { Authorization: 'Bearer ' + trimmedToken },
				}
			);
			if (response.status == 204) {
				return { response: 'success' };
			}
		} catch (err) {
			console.error(err);
		}
	}

	async play() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch(
				'https://api.spotify.com/v1/me/player/play',
				{
					method: 'PUT',
					headers: { Authorization: 'Bearer ' + trimmedToken },
					// body: {
					// 	context_uri: 'spotify:album:5ht7ItJgpBH7W6vJ5BqpPr',
					// 	offset: { position: 5 },
					// 	position_ms: 0,
					// },
				}
			);
			console.log(response.status);
			if (response.status == 204) {
				return { response: 'success' };
			}
		} catch (err) {
			console.error(err);
		}
	}

	async next() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch(
				'https://api.spotify.com/v1/me/player/next',
				{
					method: 'POST',
					headers: { Authorization: 'Bearer ' + trimmedToken },
				}
			);
			if (response.status == 204) {
				return { response: 'success' };
			}
		} catch (err) {
			console.error(err);
		}
	}

	async previous() {
		try {
			var accessToken = await this.getUserData('accessToken');
			const trimmedToken = accessToken.substring(1, accessToken.length - 1);
			const response = await fetch(
				'https://api.spotify.com/v1/me/player/previous',
				{
					method: 'POST',
					headers: { Authorization: 'Bearer ' + trimmedToken },
				}
			);
			if (response.status == 204) {
				return { response: 'success' };
			}
		} catch (err) {
			console.error(err);
		}
	}

	async setUserData(key, data) {
		try {
			await AsyncStorage.setItem(key, JSON.stringify(data));
		} catch (err) {
			console.error(err);
		}
	}

	async getUserData(key) {
		try {
			const data = await AsyncStorage.getItem(key);
			return data;
		} catch (err) {
			console.error(err);
		}
	}
}
