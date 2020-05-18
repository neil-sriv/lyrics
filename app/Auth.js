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
			console.log(redirectUrl);
			const result = await AuthSession.startAsync({
				authUrl:
					'https://accounts.spotify.com/authorize' +
					'?response_type=code' +
					'&client_id=' +
					spotifyCredentials.clientId +
					(this._scopes ? '&scope=' + encodeURIComponent(this._scopes) : '') +
					'&redirect_uri=' +
					encodeURIComponent(redirectUrl),
				// 			authUrl: `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyCredentials.client_id}
				// &redirect_uri=${encodeURIComponent(redirectUrl)}
				// &scope=${encodeURIComponent('user-read-email&response_type=token')}`,
			});
			return result.params.code;
		} catch (err) {
			console.error(err);
		}
	}

	async storeTokens() {
		try {
			const auth_code = await this.getAuthorizationCode();
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
			await this.setUserData('test', 'test');
			await this.setUserData('accessToken', accessToken);
			await this.setUserData('refreshToken', refreshToken);
			await this.setUserData('expirationTime', expirationTime);
		} catch (err) {
			console.error(err);
		}
	}

	async useRefreshToken() {
		try {
			const refreshToken = await this.getUserData('refreshToken');
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
				body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
			});
			const responseJson = await response.json();
			if (responseJson.error) {
				await this.storeTokens();
			} else {
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
				return {response: 'success'};
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
				}
			);
			if (response.status == 204) {
				return {response: 'success'};
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
				return {response: 'success'};
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
				return {response: 'success'};
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
