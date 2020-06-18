import React from 'react';
import {
	SafeAreaView,
	ScrollView,
	Text,
	StyleSheet,
	FlatList,
	TouchableWithoutFeedback,
} from 'react-native';

export default class Lyrics extends React.Component {
	flatList = React.createRef();
	constructor(props) {
		super(props);
		var song_length = this.props.duration / 1000;
		var words = this.props.lyrics.split(' ');
		this.state = {
			lyrics: this.props.lyrics,
			offset: -50,
			scrollVal: words.length / song_length,
		};
	}

	componentDidMount() {
		this._stopAutoPlay();
		this._startAutoPlay();
	}

	componentWillUnmount() {
		this._stopAutoPlay();
	}

	_goToNextPage = () => {
		this.flatList.current.scrollToOffset({ offset: this.state.offset });
		this.setState({ offset: this.state.offset + this.state.scrollVal });
	};

	_startAutoPlay = () => {
		this._timerId = setInterval(this._goToNextPage, 200);
	};

	_stopAutoPlay = () => {
		if (this._timerId) {
			clearInterval(this._timerId);
			this._timerId = null;
		}
	};

	render() {
		return (
			<SafeAreaView style={styles.scrollView}>
				<FlatList
					// flatListRef={React.createRef()}
					onScrollBeginDrag={() => {
						this._stopAutoPlay();
					}}
					onScrollEndDrag={() => {
						var offset = this.flatList.current._listRef._scrollMetrics.offset;
						this.flatList.current.scrollToOffset({ offset: offset });
						this.setState({ offset: offset + this.state.scrollVal });
						this._startAutoPlay();
					}}
					onMomentumScrollEnd={() => {}}
					ref={this.flatList}
					data={[{ id: 1, text: this.state.lyrics }]}
					renderItem={({ item }) => (
						// <TouchableWithoutFeedback onPressIn={() => alert('Pressed!')}>
						<Text
							style={{
								color: '#2AA7E7',
								fontSize: 20,
							}}
						>
							{item.text}
						</Text>
						// </TouchableWithoutFeedback>
					)}
				/>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	scrollView: {
		marginTop: 10,
		height: 300,
		width: 319,
		position: 'relative',
		backgroundColor: 'white',
		borderColor: 'white',
		borderWidth: 10,
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 0 },
	},
});
