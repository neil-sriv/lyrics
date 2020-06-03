import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default class Controls extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			paused: this.props.paused,
			repeat: 'off',
			shuffle: false,
		};
	}

	render() {
		return (
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: this.props.backgroundColor,
					marginTop: -20,
				}}
			>
				<TouchableOpacity
					style={styles.playbackButton}
					onPress={() => {
						this.props.shuffle(!this.state.shuffle);
						this.setState({ shuffle: !this.state.shuffle });
					}}
				>
					<Feather
						name="shuffle"
						size={24}
						color={this.state.shuffle ? '#2AA7E7' : 'black'}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.playbackButton}
					onPress={this.props.previous}
				>
					<Feather name="skip-back" size={24} color="black" />
				</TouchableOpacity>
				{this.state.paused ? (
					<TouchableOpacity
						style={styles.playbackButton}
						onPress={() => {
							this.props.play();
							this.setState({ paused: false });
						}}
					>
						<Feather name="play" size={24} color="black" />
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.playbackButton}
						onPress={() => {
							this.props.pause();
							this.setState({ paused: true });
						}}
					>
						<Feather name="pause" size={24} color="black" />
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={styles.playbackButton}
					onPress={this.props.next}
				>
					<Feather name="skip-forward" size={24} color="black" />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.playbackButton}
					onPress={() => {
						if (this.state.repeat == 'off') {
							this.props.repeat('context');
							this.setState({ repeat: 'context' });
						} else {
							this.props.repeat('off');
							this.setState({ repeat: 'off' });
						}
					}}
				>
					<Feather
						name="repeat"
						size={24}
						color={this.state.repeat != 'off' ? '#2AA7E7' : 'black'}
					/>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	playbackButton: {
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 10,
	},
});
