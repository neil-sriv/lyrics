import React from 'react';
import * as AuthSession from 'expo-auth-session';
import {
	StyleSheet,
	Text,
	View,
	Button,
	TouchableOpacity,
	Image,
	Alert,
	ScrollView,
	SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Auth from './Auth';
import { AsyncStorage } from 'react-native';
import SpotifyWebAPI from 'spotify-web-api-js';
import cheerio from 'react-native-cheerio';

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			accessTokenAvailable: false,
			getPlaying: false,
			paused: false,
			nowPlaying: '',
		};
		this.auth = new Auth();
	}

	componentDidMount() {}

	login = async () => {
		const tokenExpirationTime = await this.auth.getUserData('expirationTime');
		if (!tokenExpirationTime || new Date().getTime() > tokenExpirationTime) {
			await this.auth.useRefreshToken();
		} else {
			this.setState({ accessTokenAvailable: true });
		}
	};

	logout = async () => {
		await this.auth.setUserData('accessToken', '');
		await this.auth.setUserData('refreshToken', '');
		await this.auth.setUserData('expirationTime', '');
		this.setState({
			accessTokenAvailable: false,
			getPlaying: false
		})
	};

	getValidSPObj = async () => {
		const tokenExpirationTime = await this.auth.getUserData('expirationTime');
		if (!tokenExpirationTime || new Date().getTime() > tokenExpirationTime) {
			// access token has expired, so we need to use the refresh token
			await this.auth.useRefreshToken();
		}
		this.setState({ accessTokenAvailable: true });
		const accessToken = await auth.getUserData('accessToken');
		var sp = new SpotifyWebAPI();
		await sp.setAccessToken(accessToken);
		return sp;
	};

	getNowPlaying = async () => {
		const tokenExpirationTime = await this.auth.getUserData('expirationTime');
		if (
			!tokenExpirationTime ||
			new Date().getTime().toString() > tokenExpirationTime
		) {
			// access token has expired, so we need to use the refresh token
			await this.auth.useRefreshToken();
		}
		this.setState({ accessTokenAvailable: true });
		const playback = await this.auth.playbackState();
		if (!playback) {
			return Alert.alert('Spotify not playing');
		}
		const art = playback.item.album.images[0].url;
		const previous_song = this.state.nowPlaying.song_title;
		this.setState({
			getPlaying: true,
			nowPlaying: {
				album_art: art,
				song_title: playback.item.name,
				artist: playback.item.artists[0].name,
				duration: playback.item.duration_ms,
				progress: playback.progress_ms,
			},
			paused: !playback.is_playing,
		});
		if (previous_song != this.state.nowPlaying.song_title) {
			this.getLyrics();
		}
		const seconds =
			this.state.nowPlaying.duration - this.state.nowPlaying.progress;
		if (!this.state.paused && seconds > 0) {
			// console.log('calling timeout ' + (seconds/1000))
			// console.log(this.state.paused)
			setTimeout(
				function () {
					// console.log('i think it is end of song')
					this.refresh();
				}.bind(this),
				seconds + 1000
			);
		}
	};

	refresh = async () => {
		this.getNowPlaying();
	};

	getLyrics = async () => {
		try {
			const artist = this.state.nowPlaying.artist;
			const song = this.state.nowPlaying.song_title;
			const apikey =
				'wz08qBRXStlHAzZlJcX22JOGbvBGL8QFvkXdE96qpyhfQhZsTPLXmKb5NTYjFjq1';
			const url = `https://orion.apiseeds.com/api/music/lyric/${encodeURIComponent(
				artist
			)}/${encodeURIComponent(song)}?apikey=${apikey}`;
			const response = await fetch(url, {
				method: 'GET',
			});
			const responseJson = await response.json();
			if (!responseJson.result) {
				this.geniusLyrics();
			} else {
				this.setState({
					lyrics: responseJson.result.track.text,
				});
			}
		} catch (err) {
			console.error(err);
		}
	};

	geniusLyrics = async () => {
		try {
			const artist = this.state.nowPlaying.artist;
			const song = this.state.nowPlaying.song_title;
			const apikey =
				'jvUtyBqDw0PFWrnHgLcqbQDoxdAqM-GIJeU-Zoit3IiaKiuun93bK_GbFZsEcIZC';
			const search_url =
				'https://api.genius.com/search?q=' +
				encodeURIComponent(song + ' by ' + artist);
			const searchResponse = await fetch(search_url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${apikey}`,
				},
			});
			const responseJson = await searchResponse.json();
			if (responseJson.response.hits.length == 0) {
				this.setState({
					lyrics: 'No Lyrics Found',
				});
				return;
			}
			var lyrics_path = responseJson.response.hits[0].result.path;
			var i = 0;
			while (
				lyrics_path.indexOf('lyrics') == -1 &&
				responseJson.response.hits.length > i
			) {
				i += 1;
				lyrics_path = responseJson.response.hits[i].result.path;
			}
			if (
				lyrics_path &&
				responseJson.response.hits[0].result.lyrics_state == 'complete'
			) {
				const lyrics_url = 'https://genius.com' + lyrics_path;
				const lyricsResponse = await fetch(lyrics_url, {
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
				});
				// lyricsResponseJson = await lyricsResponse.json();
				var html = await lyricsResponse.text();
				const $ = cheerio.load(html);
				const l = $('.lyrics');
				console.log(lyrics_url);
				this.setState({
					lyrics: l.text().trim(),
				});
				// html = html.substring(html.indexOf('VERSE'), html.indexOf('VERSE')+1000)
				// console.log(html)
			}
		} catch (err) {
			console.error(err);
		}
	};

	pause = async () => {
		await this.auth.pause();
		this.setState({
			pause: true,
		});
		this.refresh();
	};

	play = async () => {
		await this.auth.play();
		this.setState({
			pause: false,
		});
		this.refresh();
	};

	next = async () => {
		await this.auth.next();
		this.refresh();
	};

	previous = async () => {
		await this.auth.previous();
		this.refresh();
	};

	render() {
		return this.state.accessTokenAvailable ? (
			!this.state.getPlaying ? (
				<View style={styles.container}>
					<FontAwesome name="spotify" color="#2FD566" size={128} />
					<Button title="Get Now Playing" onPress={this.getNowPlaying} />
				</View>
			) : (
				<View style={styles.container}>
					<View style={{}}>
						<Button title="Log out" style={{}} onPress={this.logout} />
					</View>
					<View style={styles.imageContainer}>
						<Image
							source={{ uri: this.state.nowPlaying.album_art }}
							style={{ height: 300, width: 300 }}
						/>
					</View>
					<Button type="primary" title="Refresh" onPress={this.refresh} />
					<Text
						style={{
							backgroundColor: 'black',
							color: 'pink',
							fontSize: 32,
						}}
					>
						{this.state.nowPlaying.song_title +
							' by ' +
							this.state.nowPlaying.artist}
					</Text>
					<SafeAreaView style={styles.scrollView}>
						<ScrollView
							style={styles.scrollView}
							ref={(ref) => {
								this.scrollView = ref;
							}}
							onContentSizeChange={() =>
								this.scrollView.scrollTo({ x: 0, y: 0, animated: true })
							}
						>
							<Text
								style={{
									color: '#ffa',
									fontSize: 20,
								}}
							>
								{this.state.lyrics}
							</Text>
						</ScrollView>
					</SafeAreaView>
					<View style={styles.row}>
						<Button
							buttonStyle={styles.playbackButton}
							title="Previous"
							onPress={this.previous}
						/>
						<Button
							buttonStyle={styles.playbackButton}
							title="Pause"
							onPress={this.pause}
						/>
						<Button
							buttonStyle={styles.playbackButton}
							title="Play"
							onPress={this.play}
						/>
						<Button
							buttonStyle={styles.playbackButton}
							title="Next"
							onPress={this.next}
						/>
					</View>
				</View>
			)
		) : (
			<View style={styles.container}>
				<Button title="login" onPress={this.login} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: Platform.OS == 'ios' ? 20 : 0,
		paddingTop: Platform.OS == 'ios' ? 20 : 0,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	scrollView: {
		backgroundColor: 'black',
		marginHorizontal: 10,
		marginVertical: 10,
		height: 250,
		alignSelf: 'stretch',
	},
	imageContainer: {
		backgroundColor: 'white',
		height: 300,
		width: 300,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playbackButton: {
		color: 'green',
	},
});
