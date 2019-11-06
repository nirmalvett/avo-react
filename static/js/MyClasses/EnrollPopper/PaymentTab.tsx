import React, {Fragment, PureComponent} from 'react';
import * as Http from '../../Http';
import {ThemeObj} from '../../Models';
import {Button, Divider, Typography} from '@material-ui/core';
// @ts-ignore
import paypal from 'paypal-checkout';
// @ts-ignore
import paypal_mode from 'js-yaml-loader!../../../../config.yaml';

const PAYPAL_MODE = JSON.parse(paypal_mode.slice(18, -2)).paypal_mode;

interface PaymentTabProps {
    enrollObj: Http.Enroll_PaymentRequired;
    onClose: () => void;
    onEnroll: () => void;
    theme: ThemeObj;
}

export class PaymentTab extends PureComponent<PaymentTabProps> {
    componentDidMount() {
        paypal.Button.render(
            {
                env: PAYPAL_MODE,
                commit: true,
                payment: payment(this.props.enrollObj.sectionID),
                onAuthorize: this.onAuthorize,
            },
            '#paypal-button',
        );
    }

    render() {
        const {tax, totalPrice} = this.props.enrollObj;
        return (
            <Fragment>
                <Typography variant='h4' color='primary' classes={{root: 'avo-padding__16px'}}>
                    Enroll code is valid.
                </Typography>
                <Typography variant='body1' classes={{root: 'avo-padding__16px'}}>
                    To confirm your selection please pay via PayPal.
                </Typography>
                <br />
                {this.priceDisplay()}
                <br />
                <Typography variant='body1' classes={{root: 'avo-padding__16px'}}>
                    Tax: ${tax.toFixed(2)}
                </Typography>
                <br />
                <Typography variant='body1' classes={{root: 'avo-padding__16px'}}>
                    Total: ${totalPrice.toFixed(2)}
                </Typography>
                <br />
                <Divider />
                <br />
                <div id='paypal-button' />
                <br />
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}
                >
                    {this.props.enrollObj.freeTrial && (
                        <Button color='primary' onClick={this.freeTrial}>
                            14 day free trial
                        </Button>
                    )}
                    <Button color='primary' onClick={this.props.onClose}>
                        Close
                    </Button>
                </div>
            </Fragment>
        );
    }

    freeTrial = () => {
        Http.freeTrial(this.props.enrollObj.sectionID, this.props.onEnroll, console.warn);
    };

    priceDisplay() {
        const {price, discount} = this.props.enrollObj;
        if (discount !== null) {
            return (
                <Fragment>
                    <s>
                        <Typography
                            component='span'
                            variant='body1'
                            color='textPrimary'
                            classes={{root: 'avo-padding__16px'}}
                        >
                            Standard Price: ${price.toFixed(2)}
                        </Typography>
                    </s>
                    <br />
                    <Typography
                        component='span'
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Discounted Price: ${discount.toFixed(2)}
                    </Typography>
                </Fragment>
            );
        } else {
            return (
                <Typography
                    component='span'
                    variant='body1'
                    color='textPrimary'
                    classes={{root: 'avo-padding__16px'}}
                >
                    Price: ${price.toFixed(2)}
                </Typography>
            );
        }
    }

    onAuthorize = (data: {paymentID: string; payerID: string}) => {
        return paypal
            .request({
                method: 'post',
                url: '/postPay',
                json: {
                    tid: data.paymentID,
                    payerID: data.payerID,
                },
            })
            .then(() => this.props.onEnroll)
            .catch(() => alert('error'));
    };
}

function payment(sectionID: number) {
    return () =>
        paypal
            .request({
                method: 'post',
                url: 'pay',
                json: {sectionID},
            })
            .then((data: {tid: string}) => data.tid);
}
