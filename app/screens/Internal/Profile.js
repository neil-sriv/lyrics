import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.auth = this.props.auth;
		this.state = {
			user: {},
		};
	}
	
	async componentDidMount() {
		const user = await this.auth.getUserData('user');
		const artists = await this.auth.getUserData('artists');
		const tracks = await this.auth.getUserData('tracks');
		this.setState({
			user: {
				name: JSON.parse(user).display_name,
				email: JSON.parse(user).email,
				followers: JSON.parse(user).followers.total,
				image_url: JSON.parse(user).images[0].url,
				artists: [JSON.parse(artists).items[0].name, JSON.parse(artists).items[1].name, JSON.parse(artists).items[2].name],
				tracks: [JSON.parse(tracks).items[0].name, JSON.parse(tracks).items[1].name, JSON.parse(tracks).items[2].name]
			}
		})

		console.log(this.state.user.artists[0])
	}

	render() {
		return (
			<View>
				{this.state.user==null ? 'null' :
				<View>
					<Image 
						source={{ uri : this.state.user.image_url }}
						style={styles.imageContainer}
					/>						

					<Text
						style={{alignSelf: 'center',
								fontSize: 24}}
					>
						{this.state.user.name}
					</Text>
					<Text
						style={{alignSelf: 'center',
								fontSize: 16}}
					>
						{this.state.user.email}
					</Text>
					<Text>{this.state.user.followers}</Text>
					<Text>
						<Text>
							<Text>Top Artists</Text>
							<Text>{this.state.user.artists}</Text>
						</Text>	
						<Text>
							<Text>Top Tracks</Text>
							{this.state.user.tracks}
						</Text>						
					</Text>

				</View>
				}
			</View>

		);
	}
}


const styles = StyleSheet.create({
	imageContainer:{ 
		height: 150, 
		width: 150, 
		alignSelf: 'center',
		borderRadius: 10,
	}
	,

})