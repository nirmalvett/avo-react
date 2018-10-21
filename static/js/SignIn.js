import React from 'react';
import Http from './Http';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import AVOModal from './AVOMatComps/AVOMatModal';
import Checkbox from '@material-ui/core/Checkbox';
import Slide from '@material-ui/core/Slide';
import { isChrome, notChromeMessage } from "./helpers";
import Logo from "./Logo"
export default class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSigningIn: true,
            rFirstName: '',
            rLastName: '',
            rEmail: '',
            rPassword1: '',
            rPassword2: '',
            username: this.props.username,
            password: this.props.password,
            signInError: '',
            hasAgreedToTOS : false
        };
        if (!isChrome()){ alert(notChromeMessage) }
    }



    componentDidMount(){
      /* This runs after the component is rendered */
      this.confirmedAccountAlert();
    }

    render() {
        let style = {'width': '100%'};

        let updateFirstName = (e) => this.setState({rFirstName: e.target.value});
        let updateLastName = (e) => this.setState({rLastName: e.target.value});
        let updateEmail = (e) => this.setState({
          rEmail: e.target.value.toLowerCase(),
          rFirstName: e.target.value.toLowerCase().replace("@uwo.ca", ""),
        }); // We're setting the email and the first name as the same value here
        let updatePassword1 = (e) => this.setState({rPassword1: e.target.value});
        let updatePassword2 = (e) => this.setState({rPassword2: e.target.value});

        let updateUsername = (e) => this.setState({username: e.target.value});
        let updatePassword = (e) => this.setState({password: e.target.value});

        let emailError = this.state.rEmail.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.rEmail);
        let rPw1Error = this.state.rPassword1.length > 0 && this.state.rPassword1.length < 8;
        let rPw2Error = this.state.rPassword2.length > 0 && this.state.rPassword2 !== this.state.rPassword1;

        let usernameError = this.state.username.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.username);
        let passwordError = this.state.password.length > 0 && this.state.password.length < 8;


        return (
            <Slide in={true} direction={'up'}>
            <Card className='LoginCard' id='avo-registrator'>
                <Grid container spacing={8} style={{'margin': '5%', 'width': '100%', 'height': '90%'}}>
                    <Grid item lg={12} style={{ 'width' : '100%' }}>                    
                    {!this.state.isSigningIn ? (
                        <React.Fragment>
                            <Typography variant='headline'>
                                Register
                            </Typography>
                            <form style={{'width': '100%'}}>
                                {/* This is the first and last name field which we will omit for now on Turnbull's request*/}
                                {/*<TextField*/}
                                    {/*margin='normal'*/}
                                    {/*style={style}*/}
                                    {/*label='First Name'*/}
                                    {/*onChange={updateFirstName}*/}
                                    {/*value={this.state.rFirstName}*/}
                                {/*/>*/}
                                {/*<br/>*/}
                                {/*<TextField*/}
                                    {/*margin='normal'*/}
                                    {/*style={style}*/}
                                    {/*label='Last Name'*/}
                                    {/*onChange={updateLastName}*/}
                                    {/*value={this.state.rLastName}*/}
                                {/*/>*/}
                                {/*<br/>*/}
                                <TextField
                                    margin='normal'
                                    style={style}
                                    label='UWO Email'
                                    onChange={updateEmail}
                                    value={this.state.rEmail} error={emailError}
                                />
                                <br/>
                                <TextField
                                    margin='normal'
                                    style={style}
                                    label='Password'
                                    type='password'
                                    onChange={updatePassword1} value={this.state.rPassword1}
                                    error={rPw1Error}
                                    helperText='(Minimum 8 characters)'
                                />
                                <br/>
                                <TextField
                                    margin='normal'
                                    style={style}
                                    label='Re-Enter Password'
                                    type='password'
                                    onChange={updatePassword2}
                                    value={this.state.rPassword2}
                                    error={rPw2Error}
                                />
                                <br/>
                                <Typography variant='caption'>
                                    <Checkbox
                                        color='primary'
                                        checked={this.state.hasAgreedToTOS}
                                        onClick={() => this.setState({ hasAgreedToTOS : !this.state.hasAgreedToTOS })}
                                    />
                                    I agree to the Terms of Service found <a id='ToC-here'>here</a>.
                                    <br/>
                                    <center style={{ 'color' : 'red' }}>
                                        {this.state.messageToUser}
                                    </center>
                                </Typography>
                                <Button
                                    color='primary'
                                    classes={{
                                        root : 'avo-button',
                                        disabled : 'disabled'
                                    }}
                                    className="avo-styles__float-right"
                                    disabled={!this.state.hasAgreedToTOS}
                                    onClick={() => this.register()}>
                                    Register
                                </Button>
                            </form>
                            <AVOModal
                                title='Terms of Service'
                                target="ToC-here"
                                acceptText='I Agree'
                                declineText='Decline'
                                onAccept={() => {
                                    this.setState({ hasAgreedToTOS : true })
                                }}
                                onDecline={() => {
                                    this.setState({ hasAgreedToTOS : false })
                                }}
                            >
                                {SignIn.getTermsOfService()}
                            </AVOModal>
                            <br/>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            {/* This is AVO Mascot which includes the logo but isn't aligning properly right now */}
                            {/*<div className="avo-mascot">*/}
                                {/*<section className="move-area">*/}
                                    {/*<div className='eye-brow left'/>*/}
                                    {/*<div className='eye-brow right'/>*/}
                                    {/*<div className='eye'/>*/}
                                    {/*<div className='eye'/>*/}
                                    {/*<div className='mouth'/>*/}
                                {/*</section>*/}
                            {/*</div>*/}
                            <Logo/>
                            <Typography variant='headline'>
                                Sign In
                            </Typography>
                            <form style={style} noValidate autoComplete='off'>
                                <TextField
                                    margin='normal'
                                    style={style}
                                    label='Email'
                                    onChange={updateUsername}
                                    value={this.state.username}
                                    error={usernameError}
                                />
                                <br/>
                                <TextField
                                    margin='normal'
                                    style={style}
                                    label='Password'
                                    type='password'
                                    onChange={updatePassword}
                                    value={this.state.password} error={passwordError}
                                />
                                <br/>
                                <Typography variant='caption' className='avo-styles__error'>
                                    {this.state.signInError}
                                </Typography>
                                <br/>
                                <Button
                                    id='avo-signin__button'
                                    color='primary'
                                    className="avo-button avo-styles__float-right"
                                    onClick={() => this.signIn()}>
                                    Sign In
                                </Button>
                            </form>
                            <br/>
                            <br/>
                            {/* We currently don't have the routes for change password */}
                            {/*<Typography variant='caption' className='avo-styles__text-center'>*/}
                                {/*{'If you forgot your password click '}*/}
                                {/*<a*/}
                                    {/*id="forgot-password__button"*/}
                                    {/*className="avo-styles__link">*/}
                                    {/*here.*/}
                                {/*</a>*/}
                            {/*</Typography>*/}
                            {/*<AVOModal*/}
                                {/*title='Forgot your password?'*/}
                                {/*target="forgot-password__button"*/}
                                {/*acceptText='Send It'*/}
                                {/*declineText='Never mind'*/}
                                {/*onAccept={() => {}}*/}
                                {/*onDecline={() => {}}*/}
                            {/*>*/}
                                {/*<React.Fragment>*/}
                                    {/*<br/>*/}
                                    {/*<Typography variant='body'>*/}
                                        {/*That's Ok! Just enter in your associated email & we'll send you an email with instructions on how to change it!*/}
                                    {/*</Typography>*/}
                                    {/*<TextField*/}
                                        {/*margin='normal'*/}
                                        {/*style={{ width: '60%' }}*/}
                                        {/*label='UWO Email'*/}
                                        {/*onChange={updateEmail}*/}
                                        {/*value={this.state.rEmail}*/}
                                        {/*error={emailError}*/}
                                        {/*/>*/}
                                    {/*<br/>*/}
                                    {/*<br/>*/}
                                {/*</React.Fragment>*/}
                            {/*</AVOModal>*/}
                        </React.Fragment>
                    )}
                    <footer className='avo-styles__footer'>
                        <Typography variant='caption'>
                            {this.state.isSigningIn ? 'Don\'t have an account? Click ' : 'Already have an Account? Click '}
                            <a
                                id="switchRegistration"
                                className="avo-styles__link"
                                onClick={() => this.setState({ isSigningIn : !this.state.isSigningIn })}
                                >
                                here
                            </a>
                            {'.'}
                        </Typography>
                    </footer>
                    </Grid>
                </Grid>
            </Card>
            </Slide>
        );
    }

    // noinspection JSMethodCanBeStatic
    register() {
      this.setState({messageToUser: "Loading..."});
       let s = this.state;
        if (this.checkInputFields()) {
            Http.register(s.rFirstName, s.rLastName, s.rEmail, s.rPassword1,
                () => {
                this.setState({
                  rFirstName: '',
                  rLastName: '',
                  rEmail: '',
                  rPassword1: '',
                  rPassword2: '',
                  username: s.rEmail,
                  password: s.rPassword1,
                  hasAgreedToTOS: false,
                  messageToUser: "Registration successful! To fully activate your account please check your email inbox/spam folder for the activation link."
                });
                },
                (result) => {
                  this.setState({messageToUser: result.error});
                },
            );
        }
    }

    allFieldsValid(){
        return '/^[a-zA-Z]{2,}\d*@uwo\.ca$/'.test(s.rEmail) && s.rPassword1.length >= 8 && s.rPassword2 === s.rPassword1;
    };

    checkInputFields(){
         let s = this.state;

         const isValid = /^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(s.rEmail) && s.rPassword1.length >= 8 && s.rPassword2 === s.rPassword1;
         if (isValid && s.hasAgreedToTOS){
             return true;
         }
         else if (!isValid){
           this.setState({messageToUser: 'Please check you email and password fields again.'})
         }
         else if (!s.hasAgreedToTOS){
           this.setState({messageToUser: 'Please click on Terms and Conditions and agree to it before registering'});
         }
    }

    // noinspection JSMethodCanBeStatic
    forgotPassword() {
        alert('Coming Soon!'); // Todo
    };

    // noinspection JSMethodCanBeStatic
    signIn() {
        Http.login(this.state.username, this.state.password, () => {
            this.props.login(this.state.username, this.state.password);
            }, (result) => {
                this.setState({ signInError : result.error });
            }
        );
    };

    static getTermsOfService() {
       return (
           <p className='ToC'>
               Terms of Service
            <br/><br/>
            1.     Under this End User License Agreement (the “Agreement”), AvocadoCore (the “Vendor”) grants to the user (the “Licensee”) a non-exclusive and non-transferable license (the “License”) to use AVO(the “Software”).
            <br/><br/>
            2.     “Software” includes the executable computer programs and any related printed, electronic and online documentation and any other files that may accompany the product.
            <br/><br/>
            3.     Title, copyright, intellectual property rights and distribution rights of the Software remain exclusively with the Vendor. Intellectual property rights include the look and feel of the Software.
            <br/><br/>
            4.     The rights and obligations of this Agreement are personal rights granted to the Licensee only. The Licensee may not transfer or assign any of the rights or obligations granted under this Agreement to any other person or legal entity. The Licensee may not make available the Software for use by one or more third parties.
            <br/><br/>
            5.     The Software may not be modified, reverse-engineered, or de-compiled in any manner through current or future available technologies.
            <br/><br/>
            6.     Failure to comply with any of the terms under the License section will be considered a material breach of this Agreement.
              <br/><br/>
             License Fee
            <br/><br/>
            7.     The original purchase price paid by the Licensee will constitute the entire license fee and is the full consideration for the Agreement.
              <br/><br/>
             Limitation of Liability
            <br/><br/>
            8.     The Software is provided by the Vendor and accepted by the Licensee “as is”. Liability of the Vendor will be limited to a maximum of the original purchase price of the Software. The Vendor will not be liable for any general, special, incidental or consequential damages including, but not limited to, loss of productions, loss of profits, loss of revenue, loss of data, or any other business or economic disadvantage suffered by the Licensee arising out of the use or failure to use the Software.
            <br/><br/>
            9.     The Vendor makes no warranty expressed or implied regarding the fitness of the Software for a particular purpose or that the Software will be suitable or appropriate for the specific requirements of the Licensee.
            <br/><br/>
            10.    The Vendor does not warrant that use of the Software will be uninterrupted or error-free. TheLicensee accepts that software in general is prone to bugs and flaws within an acceptable level as determined in the industry. Warrants and Representations
            <br/><br/>
            11.  The Vendor warrants and represents that it is the copyright holder of the Software. The Vendor warrants and represents that granting the license to use this Software is not in violation of any other agreement, copyright or applicable statute.
              <br/><br/>
             Acceptance
            <br/><br/>
            12.  All terms, conditions and obligations of this Agreement will be deemed to be accepted by theLicensee (“Acceptance”) on registration of the Software with the Vendor.User Support
            <br/><br/>
            13.  No user support or maintenance is provided as part of this Agreement.
              <br/><br/>
             Term
            <br/><br/>
            14.  The term of this Agreement will begin on Acceptance and is perpetual.
              <br/><br/>
             Termination
            <br/><br/>
            15.  This Agreement will be terminated and the License forfeited where the Licensee has failed to comply with any of the terms of this Agreement or is in breach of this Agreement. On termination of this Agreement for any reason, the Licensee will promptly destroy the Software or return the Software tot he Vendor.Force Majeure
            <br/><br/>
            16.  The Vendor will be free of liability to the Licensee where the Vendor is prevented from executing its obligations under this Agreement in whole or in part due to Force Majeure, such as earthquake, flood,
            fire or any other unforeseen and uncontrollable event where the Vendor has taken any and all appropriate action to mitigate such an event.
            <br/><br/>
            17.  The Vendor is able to update the agreement in the future whereupon an email will be sent with the updated agreement. Continued use will mean that the user agrees to the new agreement.
            <br/><br/>
            18.  Additional clause 2 Governing Law
            <br/><br/>
            19.  The Parties to this Agreement submit to the jurisdiction of the courts of the Province of Ontario for the enforcement of this Agreement or any arbitration award or decision arising from this Agreement.This Agreement will be enforced or construed according to the laws of the Province of Ontario.
              <br/><br/>
             Miscellaneous
            <br/><br/>
            20.  This Agreement can only be modified in writing signed by both the Vendor and the Licensee.
            <br/><br/>
            21.  This Agreement does not create or imply any relationship in agency or partnership between theVendor and the Licensee.
            <br/><br/>
            22.  Headings are inserted for the convenience of the parties only and are not to be considered when interpreting this Agreement. Words in the singular mean and include plural and vice versa. Words in the masculine gender include the feminine gender and vice versa. Words in the neuter gender include the masculine gender and the feminine gender and vice versa.
            <br/><br/>
            23.  If any term, covenant, condition or provision of this Agreement is held by a court of competent jurisdiction to be invalid, void or unenforceable, it is the parties’ intent that such provision be reduced in scope by the court only to the extent deemed necessary by that court to render the provision reasonable and enforceable and the remainder of the provisions of this Agreement will in no way be affected, impaired or invalidated as a result.
            <br/><br/>
            24.  This Agreement contains the entire agreement between the parties. All understandings have been included in this Agreement. Representations which may have been made by any party to thisAgreement may in some way be inconsistent with this final written Agreement. All such statements are declared to be of no value in this Agreement. Only the written terms of this Agreement will bind the parties.
            <br/><br/>
            25.  This Agreement and the terms and conditions contained in this Agreement apply to and are binding upon the Vendor’s successors and assigns.
               <br/><br/>
               ----------------------------------------------------------------------------------
               <br/><br/>
             Privacy Policy
            <br/><br/>
            26.  AvocadoCore receives authorization and consent from Users to collect, process and otherwise handle personal Information under this Privacy Policy when the user: (a) purchases the services; (b)establishes an account or registers to use the services; (c) accesses the services through account credentials that an educator has associated with the user’s personal information, such as through an institution’s course or learning management system; or (d) uses the Services.
            <br/><br/>
            27.  AvocadoCore collects and processes account data to set up, maintain and enable a user account to use the services. Account data includes a user’s first and last name, student number, email address, username and password, the institution and course identifier for any courses for which user uses the services, as well as data that helps develop and maintain AI processing technology.
            <br/><br/>
            28.  Course data means educational data collected, generated or processed through use of the services in connection with educational coursework. Course data includes assignments, student coursework,responses to interactive exercises, assignments and tests, scores, grades and instructor comments.AvocadoCore collects and processes course data in order to provide the services to users, educators and institutions for educational purposes.
            <br/><br/>
            29.  Course data is utilized in the training and use of Artificial Intelligence. This data collected includes questions, response to questions, marks of assignments and tests, mark of questions, mark of sets and response to teaching tools. AvocadoCore uses this data to train and test AvocadoCore’s ArtificialIntelligence system, To produce questions and tests for a student account based off of data collected and to give feedback to teachers based off of data collected.
            <br/><br/>
            30.  To protect personal Information, users, educators and institutions are urged to: (a) protect and never share their passwords; (b) only access the services using secure networks; (c) maintain updated internet security and virus protection software on their devices and computer systems; (d)immediately change a password and contact AvocadoCore support if there is a suspicion that the password has been compromised; and (e) contact AvocadoCore support if there is another security or privacy concern or issue.
            </p>
        );
    };

    componentDidMount() {
      /* Mascot is currently not aligning properly with the logo so this is commented out for now */
        // this.initMascot();
    };

    componentDidUpdate() {
        if(this.state.isSigningIn) {
          /* Mascot is currently not aligning properly with the logo so this is commented out for now */
            // this.initMascot();
        }
    };

    initMascot() {
        const eye_0 = document.getElementsByClassName('eye')[0];
        const eye_1 = document.getElementsByClassName('eye')[1];
        const browL = document.getElementsByClassName('eye-brow')[0];
        const browR = document.getElementsByClassName('eye-brow')[1];
        const mouth = document.getElementsByClassName('mouth')[0];
        document.addEventListener("mousemove", function (event) {
            let x = event.pageX - 40;
            let y = event.pageY - 40;
            let offsets = eye_0.getBoundingClientRect();
            let left = (offsets.left - x);
            let top = (offsets.top - y);
            let rad = Math.atan2(top, left);
            let deg = rad * (180 / Math.PI) - 90;
            document.getElementById('avo-signin__button').addEventListener('mouseover', () => {
                SignIn.mascotIntriguedExpressionCOM(eye_0, eye_1, mouth, browL, browR);
            });
            document.getElementById('avo-signin__button').addEventListener('mouseleave', () => {
                SignIn.mascotIntriguedExpressionDECOM(eye_0, eye_1, mouth, browL, browR);
            });
            document.getElementById('switchRegistration').addEventListener('mouseover', () => {
                SignIn.mascotShockedExpressionCOM(eye_0, eye_1, mouth, browL, browR);
            });
            document.getElementById('switchRegistration').addEventListener('mouseleave', () => {
                SignIn.mascotShockedExpressionDECOM(eye_0, eye_1, mouth, browL, browR);
            });
            document.getElementById('forgot-password__button').addEventListener('mouseover', () => {
                SignIn.mascotUpsetExpressionCOM(eye_0, eye_1, mouth, browL, browR);
            });
            document.getElementById('forgot-password__button').addEventListener('mouseleave', () => {
                SignIn.mascotUpsetExpressionDECOM(eye_0, eye_1, mouth, browL, browR);
            });
            eye_0.style.webkitTransform = "rotate(" + deg + "deg)";
            eye_1.style.webkitTransform = "rotate(" + deg + "deg)";
        });
    };

    static mascotUpsetExpressionCOM(eye_0, eye_1, mouth, browL, browR) {
        mouth.style.setProperty('--avo-mouth-height', '-30px');
        mouth.style.setProperty('--avo-mouth-border', 'transparent transparent #000 transparent');
        mouth.style.setProperty('--avo-mouth-bgcol', 'rgba(0, 0, 0, 0)');
        browR.style.setProperty('--avo-eyebrow-height', '-10px');
        browR.style.setProperty('--avo-eyebrow-angle', '15deg');
        browL.style.setProperty('--avo-eyebrow-height', '-10px');
        browL.style.setProperty('--avo-eyebrow-angle', '15deg');
    };

    static mascotUpsetExpressionDECOM(eye_0, eye_1, mouth, browL, browR) {
        mouth.style.setProperty('--avo-mouth-height', '30px');
        mouth.style.setProperty('--avo-mouth-border', 'transparent transparent #000 transparent');
        mouth.style.setProperty('--avo-mouth-bgcol', 'rgba(0, 0, 0, 0)');
        mouth.style.setProperty('--avo-mouth-bgcol', 'rgba(0, 0, 0, 0)');
        browL.style.setProperty('--avo-eyebrow-height', '-4px');
        browL.style.setProperty('--avo-eyebrow-angle', '10deg');
        browR.style.setProperty('--avo-eyebrow-height', '-4px');
        browR.style.setProperty('--avo-eyebrow-angle', '10deg');
    };

    static mascotIntriguedExpressionCOM(eye_0, eye_1, mouth, browL, browR) {
        mouth.style.setProperty('--avo-mouth-width', '10px');
        mouth.style.setProperty('--avo-mouth-height', '10px');
        mouth.style.setProperty('--avo-mouth-oleft', '24px');
        mouth.style.setProperty('--avo-mouth-border', 'transparent');
        mouth.style.setProperty('--avo-mouth-bgcol', 'black');
        browR.style.setProperty('--avo-eyebrow-height', '-8px');
        browR.style.setProperty('--avo-eyebrow-angle', '15deg');
    };

    static mascotIntriguedExpressionDECOM(eye_0, eye_1, mouth, browL, browR) {
        mouth.style.setProperty('--avo-mouth-width', '66px');
        mouth.style.setProperty('--avo-mouth-height', '30px');
        mouth.style.setProperty('--avo-mouth-oleft', '0px');
        mouth.style.setProperty('--avo-mouth-border', 'transparent transparent #000 transparent');
        mouth.style.setProperty('--avo-mouth-bgcol', 'rgba(0, 0, 0, 0)');
        browR.style.setProperty('--avo-eyebrow-height', '-4px');
        browR.style.setProperty('--avo-eyebrow-angle', '10deg');
    };

    static mascotShockedExpressionCOM(eye_0, eye_1, mouth, browL, browR) {
        eye_0.style.setProperty('--avo-pupil-size', '13px');
        eye_1.style.setProperty('--avo-pupil-size', '13px');
        mouth.style.setProperty('--avo-mouth-width', '15px');
        mouth.style.setProperty('--avo-mouth-height', '15px');
        mouth.style.setProperty('--avo-mouth-oleft', '24px');
        mouth.style.setProperty('--avo-mouth-border', 'transparent');
        mouth.style.setProperty('--avo-mouth-bgcol', 'black');
        browL.style.setProperty('--avo-eyebrow-height', '-10px');
        browL.style.setProperty('--avo-eyebrow-angle', '15deg');
        browR.style.setProperty('--avo-eyebrow-height', '-10px');
        browR.style.setProperty('--avo-eyebrow-angle', '15deg');
    };

    static mascotShockedExpressionDECOM(eye_0, eye_1, mouth, browL, browR) {
        eye_0.style.setProperty('--avo-pupil-size', '11px');
        eye_1.style.setProperty('--avo-pupil-size', '11px');
        mouth.style.setProperty('--avo-mouth-width', '66px');
        mouth.style.setProperty('--avo-mouth-height', '30px');
        mouth.style.setProperty('--avo-mouth-oleft', '0px');
        mouth.style.setProperty('--avo-mouth-border', 'transparent transparent #000 transparent');
        mouth.style.setProperty('--avo-mouth-bgcol', 'rgba(0, 0, 0, 0)');
        browL.style.setProperty('--avo-eyebrow-height', '-4px');
        browL.style.setProperty('--avo-eyebrow-angle', '10deg');
        browR.style.setProperty('--avo-eyebrow-height', '-4px');
        browR.style.setProperty('--avo-eyebrow-angle', '10deg');
    };

    confirmedAccountAlert(){
      const containsConfirmInUrl = window.location.href.includes('/confirm/');
      if (containsConfirmInUrl){
        alert("Your account was successfully confirmed! You may now log in and begin using AVO.")
      }
    };
};
