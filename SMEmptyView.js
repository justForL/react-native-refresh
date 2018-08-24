/**
 * Created on 17:36 2018/08/03.
 * file name SMEmptyView
 * by wangtieshan
 */

import React from 'react';

import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';

import PropTypes from 'prop-types';

export default class SMEmptyView extends React.Component {

    static defaultProps = {
        emptyTitle: {

        },
        emptySubTitle: {

        },
        emptyButton: {

        },
    };

    static propTypes = {
        /// 空视图图片
        emptyImage: PropTypes.any,
        /// 空视图标题
        emptyTitle: PropTypes.shape({
            title: PropTypes.string,
            titleStyle: PropTypes.object,
        }),
        /// 空视图副标题
        emptySubTitle: PropTypes.shape({
            title: PropTypes.string,
            titleStyle: PropTypes.object,
        }),
        /// 空视图按钮
        emptyButton: PropTypes.shape({
            style: PropTypes.object,
            title: PropTypes.string,
            titleStyle: PropTypes.object,
            onPress: PropTypes.func,
        })
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[{alignItems: 'center', paddingTop: 60,}, this.props.style,]}>
                <Image source={this.props.emptyImage} style={{marginTop: 60,}}/>
                <Text style={[styles.title, this.props.emptyTitle.titleStyle]}>
                    {this.props.emptyTitle.title}
                    </Text>
                <Text style={[styles.subTitle, this.props.emptySubTitle.titleStyle]}>
                    {this.props.emptySubTitle.title}
                    </Text>
                <TouchableOpacity activeOpacity={0.6}
                                  style={[styles.button, this.props.emptyButton.title ? {} : {display: 'none'}, this.props.emptyButton.style]}
                                  onPress={()=>{
                                      if (this.props.emptyButton.onPress) {
                                          this.props.emptyButton.onPress()
                                      }
                                  }}>
                    <Text style={[{color: 'black', fontSize: 16, }, this.props.emptyButton.titleStyle]}>{this.props.emptyButton.title}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        backgroundColor: '#FFD519',
        borderRadius: 25,
        minWidth: 200,
        marginTop: 30,
    },
    title: {
        color: '#4a4a4a',
        fontSize: 16,
        marginTop: 20,
    },
    subTitle: {
        color: 'gray',
        fontSize: 14,
        marginTop: 20,
    }
});