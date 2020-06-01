import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Button,
	TouchableOpacity,
	Image,
	Alert,
} from 'react-native';
import cheerio from 'react-native-cheerio';
import VerticalSlider from 'rn-vertical-slider';
import Lyrics from './PlayerComponents/Lyrics';
import Controls from './PlayerComponents/Controls';
import { createStackNavigator } from '@react-navigation/stack';

export default class Player extends React.Component {
	constructor(props) {
		super(props);
		this.auth = this.props.auth;
		this.state = {
			getPlaying: false,
			paused: false,
			nowPlaying: '',
			style: { backgroundColor: 'rgb(229, 119, 280)', textColor: 'rgb(0,0,0)' },
			showSlider: false,
			slider: 50,
			lyrics: 'No Lyrics Found',
			remountKey: false,
		};
		this.props.navigation.setOptions({
			headerRight: () => <Button title="Log Out" onPress={this.logout} />,
			headerLeft: () => <Button title="Refresh" onPress={this.refresh} />,
            headerTransparent: true,
            title: '',
		});
	}

	componentDidMount() {
		this.refresh();
	}

	refresh = async () => {
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
				console.log(url.substring(0, url.indexOf('?')));
				this.setState({
					lyrics: responseJson.result.track.text,
					remountKey: !this.state.remountKey,
				});
			}
		} catch (err) {
			console.error(err);
		}
	};

	geniusLyrics = async () => {
		try {
			let artist = this.state.nowPlaying.artist;
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
			artist = artist.replace(' ', '-');
			var i = 0;
			while (
				(lyrics_path.indexOf('lyrics') == -1 ||
					lyrics_path.toLowerCase().indexOf(artist.toLowerCase()) == -1) &&
				responseJson.response.hits.length > i
			) {
				lyrics_path = responseJson.response.hits[i].result.path;
				i += 1;
			}
			if (lyrics_path.toLowerCase().indexOf(artist.toLowerCase()) == -1) {
				lyrics_path = null;
				console.log('No Lyrics Found');
				this.setState({
					lyrics: 'No Lyrics Found',
					remountKey: !this.state.remountKey,
				});
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
					remountKey: !this.state.remountKey,
				});
				// html = html.substring(html.indexOf('VERSE'), html.indexOf('VERSE')+1000)
				// console.log(html)
			}
		} catch (err) {
			console.error(err);
		}
	};

	play = async () => {
		await this.auth.play();
		this.setState({
			paused: false,
		});
		this.refresh();
	};

	pause = async () => {
		await this.auth.pause();
		this.setState({
			paused: true,
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

	logout = async () => {
		await this.auth.setUserData('accessToken', '');
		await this.auth.setUserData('refreshToken', '');
		await this.auth.setUserData('expirationTime', '');
		this.setState({
			accessTokenAvailable: false,
			getPlaying: false,
		});
		this.props.navigation.replace('Login');
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: this.state.style.backgroundColor,
					// alignItems: 'center',
					// justifyContent: 'center',
					// paddingTop: Platform.OS == 'ios' ? 40 : 0,
				}}
			>
				<View
					title="Margin"
					style={{
						height: 75,
					}}
				></View>
				<View
					title="Image and Slider"
					style={{
						flex: 3,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: this.state.style.backgroundColor,
					}}
				>
					<View style={styles.imageContainer}>
						<Image
							source={{ uri: this.state.nowPlaying.album_art }}
							style={{ height: 150, width: 150 }}
						/>
					</View>
						<View
							style={{
								paddingHorizontal: 10,
								backgroundColor: this.state.style.backgroundColor,
								marginLeft: 300
							}}
						>
							{this.state.showSlider ? (
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor: this.state.style.backgroundColor,
									}}
								>
									<VerticalSlider
										style={{
											display: 'none',
										}}
										value={this.state.slider}
										disabled={false}
										min={0}
										max={100}
										onChange={(value) => {
											this.setState({
												style: {
													backgroundColor: `rgb(${
														Math.sin(0.06 * value + 0) * 100 + 215
													}, ${Math.sin(0.06 * value + 2) * 100 + 215}, ${
														Math.sin(0.06 * value + 4) * 100 + 215
													})`,
												},
												slider: value,
											});
										}}
										onComplete={(value) => {
											// console.log('COMPLETE', value);
										}}
										width={30}
										height={200}
										step={1}
										borderRadius={100}
										borderColor={'red'}
										minimumTrackTintColor={'rgb(255, 100, 100)'}
										maximumTrackTintColor={'rgb(155, 200, 300)'}
									/>
									<Button
										title="Hide"
										onPress={() =>
											this.setState({
												showSlider: false,
											})
										}
									/>
								</View>
							) : (
								<Button
									style={{
										paddingLeft: 100
									}}
									title="0"
									onPress={() =>
										this.setState({
											showSlider: true,
										})
									}
								/>
							)}
						</View>
				</View>

				<View
					title="Title and Artist"
				>
					<Text style={styles.title}>{this.state.nowPlaying.song_title}</Text>
					<Text style={styles.artist}>{this.state.nowPlaying.artist}</Text>
				</View>
				<View
					style={{
						flex: 5,
						paddingLeft: 20,
					}}
				>
					<Lyrics
						lyrics={this.state.lyrics}
						key={this.state.remountKey}
						test={this.pause}
						backgroundColor={this.state.style.backgroundColor}
					/>
				</View>
				<View
					style={{
						flex: 1,
					}}
				>
					<Controls
						backgroundColor={this.state.style.backgroundColor}
						previous={this.previous}
						play={this.play}
						pause={this.pause}
						next={this.next}
					/>
				</View>
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
		backgroundColor: 'black',
	},
	scrollView: {
		backgroundColor: 'black',
		marginHorizontal: 10,
		marginTop: 10,
		height: 200,
		alignSelf: 'stretch',
	},
	imageContainer: {
		backgroundColor: 'black',
		height: 150,
		width: 150,
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: 'white',
		borderWidth: 85,
		borderRadius: 10,
		position: 'absolute'
	},
	title: {
		textAlign: 'center',
		color: 'black',
		fontSize: 40,
	},
	artist: {
		textAlign: 'center',
		color: 'black',
		fontSize: 20,
	},
});
