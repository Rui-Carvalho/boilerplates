import React, { Component } from 'react';
import Modal from 'react-modal';
import { Form, Text, FormError } from 'react-form';
import axios from "axios";
import CountriesService from 'Services/countries-service';
import GeoIPService from 'Services/geoip-service';

const customStyles = {
    overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(34, 38, 49, 0.80)',
        zIndex            : 99998
    },
    content : {
        boxShadow         : '0px 0px 20px 0px rgba(0, 0, 0, 0.5)',
        border            : 'none',
        background        : 'none',
        top               : '50%',
        left              : '50%',
        right             : 'auto',
        bottom            : 'auto',
        marginRight       : '-50%',
        transform         : 'translate(-50%, -50%)',
        maxWidth          : '755px',
        maxHeight         : '690px',
        width             : '75%',
        height            : '70%',
        borderRadius      : '4px',
        padding           : 'unset',
        backgroundColor   : '#191C24'
    }
};
const emailChecker = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default class SignUp extends Component {

    static SIGNUP_STAGE_INITIAL         = "initial";
    static SIGNUP_STAGE_SENDING         = "sending";
    static SIGNUP_STAGE_FINAL           = "final";
    static SIGNUP_STAGE_RESENDING_EMAIL = "resending-email";

    static RESEND_EMAIL_LIMIT      = 3;
    static SIGNUP_URL              = APP_DOMAIN + "/user/signup";
    static SIGNUP_RESEND_EMAIL_URL = APP_DOMAIN + "/user/signup/resend";

    constructor(props)
    {
        super(props);

        this.state = {
            showSignupModal: false,
            stage: SignUp.SIGNUP_STAGE_INITIAL,
            formHasErrors: false,
            formErrors: {
                firstName: null,
                lastName: null,
                email: null,
                countryOfResidence: null
            },
            formResendHasErrors: false,
            formResendCount: 0,
            signUpData: {
                firstName: null,
                lastName: null,
                email: null,
                countryOfResidence: ""
            },
            submitError: null,
            receivedToken: null,
            countriesList: {},
            userGeoIPInfo: {}
        };

        this.openModal      = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal     = this.closeModal.bind(this);

        CountriesService.getListOfCountries().then(data => {
            this.state.countriesList = data;
            this.setState(this.state); //TODO: [RUI] Use more robust approach
        });
        GeoIPService.getCountryForUser().then(data => {
            this.state.userGeoIPInfo = data;
            this.state.signUpData.countryOfResidence = data.country_code;
            this.setState(this.state); //TODO: [RUI] Use more robust approach
        });
    }

    componentDidMount()
    {
        let signUpOpen = window.location.search.substring(1);
        if(signUpOpen === 'signup' && localStorage.getItem('signUpOpened') !== 'true') {
            localStorage.setItem('signUpOpened', 'true');
            this.openModal();
        }
    }

    openModal()
    {
        this.sendGAEvent('signup', 'click-open-modal');
        this.setState({showSignupModal: true});
    }

    afterOpenModal()
    {
        // references are now sync'd and can be accessed.
        //this.subtitle.style.color = '#f00';
    }

    closeModal()
    {
        this.sendGAEvent('signup', 'click-close-modal');
        this.setState({showSignupModal: false});
        localStorage.removeItem('signUpOpened');
    }

    submitSignUp(values)
    {
        this.setState({ stage : SignUp.SIGNUP_STAGE_SENDING });

        const country_iso = document.querySelector("select#countryOfResidence").value; //TODO: make this React-Form <Select> => solve defaultValue problem on Select components!
        let body = {
            first_name  : values.firstName,
            last_name   : values.lastName,
            email       : values.email,
            country_iso : CountriesService.isValidCountryISO(country_iso) ? country_iso : null
        };

        axios({
            method: "post",
            url: SignUp.SIGNUP_URL,
            data: JSON.stringify(body),
            headers: {
                'Accept'      : 'application/json; charset=utf-8',
                'Content-Type': 'application/json'
            }
        }).then(function (response) {

            if(response.data.successful === true) {
                console.log('Successfully created a sign up entry for user');
                this.setState({
                    stage : SignUp.SIGNUP_STAGE_FINAL,
                    receivedToken: response.data.token
                });
                this.sendGAEvent('signup', 'registration', 'success');
            }
            else {
                console.log('Error: ' + response.data.error);
                this.setState({
                    formHasErrors : true,
                    stage : SignUp.SIGNUP_STAGE_INITIAL,
                    submitError: response.data.error
                });
                this.sendGAEvent('signup', 'registration', 'error in data');
            }

        }.bind(this))
        .catch(function (error) {
            console.log('Error in signup: ' + error);
            this.setState({stage : SignUp.SIGNUP_STAGE_INITIAL});
            this.sendGAEvent('signup', 'registration', 'error in server');
        }.bind(this));
    }

    handleResendEmail(event)
    {
        if(this.state.formResendCount >= SignUp.RESEND_EMAIL_LIMIT) {
            this.setState({
                formResendHasErrors: true,
                submitError: "The e-email has been resent too many times. Contact us if you are experiencing any problems."
            });
            return false;
        }

        this.setState({ stage: SignUp.SIGNUP_STAGE_RESENDING_EMAIL });
        let body = {};
        axios({
            method: "get",
            url: `${SignUp.SIGNUP_RESEND_EMAIL_URL}/${this.state.receivedToken}`,
            data: JSON.stringify(body),
            headers: {
                'Accept'      : 'application/json; charset=utf-8',
                'Content-Type': 'application/json'
            }
        }).then(function (response) {

            if(response.data.successful === true) {
                console.log('Successfully resent email to the user');
                this.setState({ stage: SignUp.SIGNUP_STAGE_FINAL });
                this.sendGAEvent('signup', 'resend-email', 'success');
                this.state.formResendCount++;
            }
            else {
                console.log('Error: ' + response.data.error);
                this.setState({
                    stage : SignUp.SIGNUP_STAGE_FINAL,
                    formResendHasErrors : true,
                    submitError: response.data.error
                });
                this.sendGAEvent('signup', 'resend-email', 'error in data');
            }

        }.bind(this))
        .catch(function (error) {
                console.log('Error in Resend: ' + error);
                this.sendGAEvent('signup', 'resend-email', 'error in server');
        }.bind(this));
    }

    sendGAEvent(category, action, label)
    {
        ga('send', {
            hitType: 'event',
            eventCategory: category,
            eventAction: action,
            eventLabel: label || ''
        });
    }

    getInitialForm()
    {
        return (
            <Form
                onSubmit={(values) => {
                    this.submitSignUp(values);
                }}
                //defaultValues={{firstName: 'Set in future if read from somewhere'}}
                validate={ (values) => {
                    const { firstName, lastName, email, countryOfResidence } = values;
                    return {
                        firstName          : !firstName          || (firstName && firstName.length < 2)  ?    'Invalid first name.'    : null,
                        lastName           : !lastName           || (lastName && lastName.length < 2)    ?    'Invalid last name.'     : null,
                        email              : !email              || (email && !emailChecker.test(email)) ?    'Invalid email address.' : null,
                        //TODO: countryOfResidence : !CountriesService.isValidCountryISO(countryOfResidence) ? 'Invalid country.' : null
                    }
                }}
                onValidationFail={ (values, state) => {
                    this.sendGAEvent('signup', 'form-has-errors', `${state.errors.firstName} ${state.errors.lastName} ${state.errors.email}`);
                    this.setState({
                        formHasErrors: true,
                        formErrors: {
                            firstName: state.errors.firstName,
                            lastName: state.errors.lastName,
                            email: state.errors.email,
                            //TODO: countryOfResidence: state.errors.countryOfResidence
                        }
                    });
                    console.log('Form has errors');
                }}
            >
                {({ values, submitForm, addValue, removeValue, getError }) => {
                    return (
                        <form onSubmit={ submitForm }>
                            { this.getInitialFormContent() }
                        </form>
                    )
                }}
            </Form>
        );
    }

    onValueChange = (event) => //Param: React.KeyboardEvent | React.MouseEvent
    {
        const target     = event.target;
        const signUpData = { ...this.state.signUpData, [target.name]: target.value };
        const newState   = { ...this.state, signUpData: signUpData };
        this.setState(newState);
    };

    getInitialFormContent()
    {
        let label = {
            firstName : 'First Name',
            lastName : 'Last Name',
            email : 'E-mail',
            countryResidence : 'Country of Residence'
        };

        let placeholder = {
            firstName : 'John',
            lastName : 'Doe',
            email : 'john@doe.com'
        };

        const countryOptions = this.state.countriesList.map(country =>
            <option key={country.iso} value={country.iso}>{country.name}</option>
        );


        return (
            <div className="signup__container">
                <div>
                    <h1 className="signup__panel-title">Let's get started</h1>
                    <div className="signup__panel-text" style={{marginBottom: '5px'}}>
                        Please provide your true name and email address in order to sign-up.
                    </div>
                    {   this.state.formHasErrors && this.getErrorsLayout() }
                    {   !this.state.formHasErrors && <div className="signup__spacer-not-errors">&nbsp;</div> }
                    <div className="signup__panel-fields">
                        <div className="signup__panel-field left">
                            <label htmlFor="signup-firstname">{ label.firstName }</label>
                            {   this.state.formHasErrors && this.state.formErrors.firstName === null &&
                                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODkzLjcwNCIgaGVpZ2h0PSI4OTMuNzA1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiAgPGc+ICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+ICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfMSI+ICAgPGcgc3Ryb2tlPSJudWxsIiBpZD0ic3ZnXzgiPiAgICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfNyI+ICAgICA8cGF0aCBzdHJva2U9Im51bGwiIGZpbGw9IiMwYmZmODciIGQ9Im03NjUuMDQ0MTYsNzQuMTk4bDExOS40NDE3OSwxMDAuNzk0YzcuMTQ0OTYsNi4wODQgOC40NjgwNiwxNy40MDUgMi4yOTQ1NywyNC44MjJsLTUxMy4yMjE3Myw2MTUuNjljLTQuMDU2NzIsNC44ODQgLTkuNjYxMDMsNi45MjcgLTE1LjEyOTI2LDYuMjE2Yy0zLjgzNDIyLC0wLjE3OCAtNy42Mjg3LC0xLjYgLTEwLjgwMzM1LC00LjI2M2wtMzM4LjA3NTU0LC0yODUuNmMtNy41NDMyOCwtNi4zMDUgLTguODI0NjYsLTE3Ljc2MiAtMi42MDQ0OSwtMjUuMjIxbDk5Ljg1NTUsLTExOS44YzYuMDQzMzYsLTcuMjM2IDE3LjUxMDI1LC04LjI1OSAyNS4xODU2NCwtMS43NzZsMjA1Ljk3Njg2LDE3My45NzVsNDAyLjM4MjEsLTQ4Mi44NGM2LjYxNTUxLC03Ljg1OCAxNy4yODg3NCwtOC4zMDEgMjQuNjk3OTEsLTEuOTk3eiIgaWQ9InN2Z182Ii8+ICAgIDwvZz4gICA8L2c+ICA8L2c+IDwvZz48L3N2Zz4=" />
                            }
                            {   this.state.formHasErrors && this.state.formErrors.firstName !== null &&
                                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyLjk4MiIgaGVpZ2h0PSIyMTIuOTgyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiA8Zz4gIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4gIDxyZWN0IHg9Ii0xIiB5PSItMSIgd2lkdGg9IjIxNC45ODIiIGhlaWdodD0iMjE0Ljk4MiIgaWQ9ImNhbnZhc19iYWNrZ3JvdW5kIiBmaWxsPSJub25lIi8+IDwvZz4gPGc+ICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+ICA8ZyBpZD0iQ2xvc2UiPiAgIDxwYXRoIGQ9Im0xMzEuODA0LDEwNi40OTFsNzUuOTM2LC03NS45MzZjNi45OSwtNi45OSA2Ljk5LC0xOC4zMjMgMCwtMjUuMzEyYy02Ljk5LC02Ljk5IC0xOC4zMjIsLTYuOTkgLTI1LjMxMiwwbC03NS45MzcsNzUuOTM3bC03NS45MzcsLTc1LjkzOGMtNi45OSwtNi45OSAtMTguMzIyLC02Ljk5IC0yNS4zMTIsMGMtNi45ODksNi45OSAtNi45ODksMTguMzIzIDAsMjUuMzEybDc1LjkzNyw3NS45MzZsLTc1LjkzNyw3NS45MzdjLTYuOTg5LDYuOTkgLTYuOTg5LDE4LjMyMyAwLDI1LjMxMmM2Ljk5LDYuOTkgMTguMzIyLDYuOTkgMjUuMzEyLDBsNzUuOTM3LC03NS45MzdsNzUuOTM3LDc1LjkzN2M2Ljk4OSw2Ljk5IDE4LjMyMiw2Ljk5IDI1LjMxMiwwYzYuOTksLTYuOTkgNi45OSwtMTguMzIyIDAsLTI1LjMxMmwtNzUuOTM2LC03NS45MzZ6IiBmaWxsPSIjZjA1YzZlIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaWQ9InN2Z18xIi8+ICA8L2c+IDwvZz48L3N2Zz4=" />
                            }
                            <Text field='firstName' showErrors={false} placeholder={ placeholder.firstName } id="signup-firstname" />
                        </div>
                        <div className="signup__panel-field right">
                            <label htmlFor="signup-lastname">{ label.lastName }</label>
                            {   this.state.formHasErrors && this.state.formErrors.lastName === null &&
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODkzLjcwNCIgaGVpZ2h0PSI4OTMuNzA1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiAgPGc+ICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+ICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfMSI+ICAgPGcgc3Ryb2tlPSJudWxsIiBpZD0ic3ZnXzgiPiAgICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfNyI+ICAgICA8cGF0aCBzdHJva2U9Im51bGwiIGZpbGw9IiMwYmZmODciIGQ9Im03NjUuMDQ0MTYsNzQuMTk4bDExOS40NDE3OSwxMDAuNzk0YzcuMTQ0OTYsNi4wODQgOC40NjgwNiwxNy40MDUgMi4yOTQ1NywyNC44MjJsLTUxMy4yMjE3Myw2MTUuNjljLTQuMDU2NzIsNC44ODQgLTkuNjYxMDMsNi45MjcgLTE1LjEyOTI2LDYuMjE2Yy0zLjgzNDIyLC0wLjE3OCAtNy42Mjg3LC0xLjYgLTEwLjgwMzM1LC00LjI2M2wtMzM4LjA3NTU0LC0yODUuNmMtNy41NDMyOCwtNi4zMDUgLTguODI0NjYsLTE3Ljc2MiAtMi42MDQ0OSwtMjUuMjIxbDk5Ljg1NTUsLTExOS44YzYuMDQzMzYsLTcuMjM2IDE3LjUxMDI1LC04LjI1OSAyNS4xODU2NCwtMS43NzZsMjA1Ljk3Njg2LDE3My45NzVsNDAyLjM4MjEsLTQ4Mi44NGM2LjYxNTUxLC03Ljg1OCAxNy4yODg3NCwtOC4zMDEgMjQuNjk3OTEsLTEuOTk3eiIgaWQ9InN2Z182Ii8+ICAgIDwvZz4gICA8L2c+ICA8L2c+IDwvZz48L3N2Zz4=" />
                            }
                            {   this.state.formHasErrors && this.state.formErrors.lastName !== null &&
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyLjk4MiIgaGVpZ2h0PSIyMTIuOTgyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiA8Zz4gIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4gIDxyZWN0IHg9Ii0xIiB5PSItMSIgd2lkdGg9IjIxNC45ODIiIGhlaWdodD0iMjE0Ljk4MiIgaWQ9ImNhbnZhc19iYWNrZ3JvdW5kIiBmaWxsPSJub25lIi8+IDwvZz4gPGc+ICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+ICA8ZyBpZD0iQ2xvc2UiPiAgIDxwYXRoIGQ9Im0xMzEuODA0LDEwNi40OTFsNzUuOTM2LC03NS45MzZjNi45OSwtNi45OSA2Ljk5LC0xOC4zMjMgMCwtMjUuMzEyYy02Ljk5LC02Ljk5IC0xOC4zMjIsLTYuOTkgLTI1LjMxMiwwbC03NS45MzcsNzUuOTM3bC03NS45MzcsLTc1LjkzOGMtNi45OSwtNi45OSAtMTguMzIyLC02Ljk5IC0yNS4zMTIsMGMtNi45ODksNi45OSAtNi45ODksMTguMzIzIDAsMjUuMzEybDc1LjkzNyw3NS45MzZsLTc1LjkzNyw3NS45MzdjLTYuOTg5LDYuOTkgLTYuOTg5LDE4LjMyMyAwLDI1LjMxMmM2Ljk5LDYuOTkgMTguMzIyLDYuOTkgMjUuMzEyLDBsNzUuOTM3LC03NS45MzdsNzUuOTM3LDc1LjkzN2M2Ljk4OSw2Ljk5IDE4LjMyMiw2Ljk5IDI1LjMxMiwwYzYuOTksLTYuOTkgNi45OSwtMTguMzIyIDAsLTI1LjMxMmwtNzUuOTM2LC03NS45MzZ6IiBmaWxsPSIjZjA1YzZlIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaWQ9InN2Z18xIi8+ICA8L2c+IDwvZz48L3N2Zz4=" />
                            }
                            <Text field='lastName' showErrors={false} placeholder={ placeholder.lastName } id="signup-lastname" />
                        </div>
                        <div className="signup__panel-field full">
                            <label htmlFor="signup-email">{ label.email }</label>
                            {   this.state.formHasErrors && this.state.formErrors.email === null &&
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODkzLjcwNCIgaGVpZ2h0PSI4OTMuNzA1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiAgPGc+ICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+ICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfMSI+ICAgPGcgc3Ryb2tlPSJudWxsIiBpZD0ic3ZnXzgiPiAgICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfNyI+ICAgICA8cGF0aCBzdHJva2U9Im51bGwiIGZpbGw9IiMwYmZmODciIGQ9Im03NjUuMDQ0MTYsNzQuMTk4bDExOS40NDE3OSwxMDAuNzk0YzcuMTQ0OTYsNi4wODQgOC40NjgwNiwxNy40MDUgMi4yOTQ1NywyNC44MjJsLTUxMy4yMjE3Myw2MTUuNjljLTQuMDU2NzIsNC44ODQgLTkuNjYxMDMsNi45MjcgLTE1LjEyOTI2LDYuMjE2Yy0zLjgzNDIyLC0wLjE3OCAtNy42Mjg3LC0xLjYgLTEwLjgwMzM1LC00LjI2M2wtMzM4LjA3NTU0LC0yODUuNmMtNy41NDMyOCwtNi4zMDUgLTguODI0NjYsLTE3Ljc2MiAtMi42MDQ0OSwtMjUuMjIxbDk5Ljg1NTUsLTExOS44YzYuMDQzMzYsLTcuMjM2IDE3LjUxMDI1LC04LjI1OSAyNS4xODU2NCwtMS43NzZsMjA1Ljk3Njg2LDE3My45NzVsNDAyLjM4MjEsLTQ4Mi44NGM2LjYxNTUxLC03Ljg1OCAxNy4yODg3NCwtOC4zMDEgMjQuNjk3OTEsLTEuOTk3eiIgaWQ9InN2Z182Ii8+ICAgIDwvZz4gICA8L2c+ICA8L2c+IDwvZz48L3N2Zz4=" />
                            }
                            {   this.state.formHasErrors && this.state.formErrors.email !== null &&
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyLjk4MiIgaGVpZ2h0PSIyMTIuOTgyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiA8Zz4gIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4gIDxyZWN0IHg9Ii0xIiB5PSItMSIgd2lkdGg9IjIxNC45ODIiIGhlaWdodD0iMjE0Ljk4MiIgaWQ9ImNhbnZhc19iYWNrZ3JvdW5kIiBmaWxsPSJub25lIi8+IDwvZz4gPGc+ICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+ICA8ZyBpZD0iQ2xvc2UiPiAgIDxwYXRoIGQ9Im0xMzEuODA0LDEwNi40OTFsNzUuOTM2LC03NS45MzZjNi45OSwtNi45OSA2Ljk5LC0xOC4zMjMgMCwtMjUuMzEyYy02Ljk5LC02Ljk5IC0xOC4zMjIsLTYuOTkgLTI1LjMxMiwwbC03NS45MzcsNzUuOTM3bC03NS45MzcsLTc1LjkzOGMtNi45OSwtNi45OSAtMTguMzIyLC02Ljk5IC0yNS4zMTIsMGMtNi45ODksNi45OSAtNi45ODksMTguMzIzIDAsMjUuMzEybDc1LjkzNyw3NS45MzZsLTc1LjkzNyw3NS45MzdjLTYuOTg5LDYuOTkgLTYuOTg5LDE4LjMyMyAwLDI1LjMxMmM2Ljk5LDYuOTkgMTguMzIyLDYuOTkgMjUuMzEyLDBsNzUuOTM3LC03NS45MzdsNzUuOTM3LDc1LjkzN2M2Ljk4OSw2Ljk5IDE4LjMyMiw2Ljk5IDI1LjMxMiwwYzYuOTksLTYuOTkgNi45OSwtMTguMzIyIDAsLTI1LjMxMmwtNzUuOTM2LC03NS45MzZ6IiBmaWxsPSIjZjA1YzZlIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaWQ9InN2Z18xIi8+ICA8L2c+IDwvZz48L3N2Zz4=" />
                            }
                            <Text field='email' showErrors={false} placeholder={ placeholder.email } id="signup-email" />
                        </div>

                        <div className="signup__panel-field full">
                            <label htmlFor="country">{ label.countryResidence }</label>
                            <select name="countryOfResidence" id="countryOfResidence" value={this.state.signUpData.countryOfResidence} onChange={this.onValueChange}>
                                { countryOptions }
                            </select>
                        </div>

                    </div>

                    <div className="signup__panel-buttons">
                        {   this.state.stage === SignUp.SIGNUP_STAGE_SENDING ?
                            (
                                <span>Sending...</span>
                            ) :
                            (
                                <button type="submit" className="signup__panel-button-agree">Sign Up</button>
                            )
                        }
                    </div>
                </div>
                <div>
                    <p className="signup__panel-text-login text-center">
                        Already have an account?<a href={`${APP_URL}/#/login`} onClick={() => localStorage.removeItem('signUpOpened')} className="signup__login">Login</a>
                    </p>
                </div>
            </div>
        );
    }

    getErrorsLayout()
    {
        return <div className="signup__errors">
            <FormError field='firstName' className="singup__form-error"/>&nbsp;
            <FormError field='lastName' />&nbsp;
            <FormError field='email' />
            {   this.state.submitError !== null &&
                <div>
                    { this.state.submitError }
                </div>
            }
        </div>;
    }

    getFinalLayout()
    {
        return <div className="signup__container">

            <h1 className="signup__panel-title resend">Check your email</h1>
            {   this.state.formResendHasErrors &&
                <div className="signup__errors" style={{ marginBottom: '20px' }}>
                    { this.state.submitError }
                </div>
            }
            <div className="signup__panel-fields check-email">
                We have just sent you a confirmation email. Please click on the link in the email to complete the sign-up.
            </div>

            <div className="signup__panel-text">
                <div>
                    <div className="signup__panel-buttons">
                        <button type="button" onClick={ (event) => this.closeModal() } className="signup__panel-button-agree">Close</button>
                    </div>
                </div>
            </div>

            <div className="signup__panel-text-resend">
                <div>
                    <p>
                        Not received the e-mail?
                    </p>
                    <div className="signup__panel-buttons resend">
                        {   this.state.stage === SignUp.SIGNUP_STAGE_RESENDING_EMAIL ?
                            (
                                <span>Sending...</span>
                            ) :
                            (
                                <button type="button" onClick={ (event) => this.handleResendEmail(event) } className="signup__panel-button-disagree resend">Re-send Email</button>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>;
    }

    setContent()
    {
        switch (this.state.stage)
        {
            case SignUp.SIGNUP_STAGE_INITIAL:
            case SignUp.SIGNUP_STAGE_SENDING:
                return this.getInitialForm();
                break;
            case SignUp.SIGNUP_STAGE_FINAL:
            case SignUp.SIGNUP_STAGE_RESENDING_EMAIL:
                return this.getFinalLayout();
                break;
        }
    }

    render()
    {
        return (
            <div>
                <button className="button modal-trigger" onClick={ (event) => this.openModal(event) } >Sign Up</button>
                <Modal
                    isOpen={this.state.showSignupModal}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Signup Modal"
                >
                    { this.setContent() }
                </Modal>
            </div>
        );
    }
}
