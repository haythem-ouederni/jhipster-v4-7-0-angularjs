package com.jhipsterangularjs.test.cucumber.stepdefs;

import com.jhipsterangularjs.test.JhipsterAngularJsApp;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.ResultActions;

import org.springframework.boot.test.context.SpringBootTest;

@WebAppConfiguration
@SpringBootTest
@ContextConfiguration(classes = JhipsterAngularJsApp.class)
public abstract class StepDefs {

    protected ResultActions actions;

}
