# ADR 2: Bringing [Formik](https://formik.org/) into Our React Project

## The Situation

In the world of modern web application development, we often grapple with tasks like handling forms, validation, and form state management. These tasks can be quite complex and repetitive. To simplify these tasks, we need a robust solution that can handle these operations efficiently and effectively. In the context of a React application, we've decided to go with Formik.

## The Decision

We've made the call to use Formik in our React project.

## The Reasoning

1. **Simplicity**: Formik simplifies forms in React by managing your form's state and providing validation functions.
2. **Form State Management**: Formik takes care of the repetitive and annoying stuff - keeping track of values/errors/visited fields, orchestrating validation, and handling submission.
3. **Validation and Error Messages**: Formik supports synchronous, asynchronous, and schema-based (Yup) validation out of the box. It also manages error messages for you.
4. **Handles Form Submission**: Formik provides a handleSubmit function that you can pass to your form's onSubmit prop. It automatically prevents the default form submission behavior and then performs the form submission logic you define.
5. **Performance**: Formik only runs validations when necessary - reducing unnecessary renders and improving performance.
6. **Community and Ecosystem**: Formik is widely adopted in the React community and has a large ecosystem of plugins, which can be beneficial for future-proofing your application.
7. **Integration with React**: As Formik is built for React, it integrates well with the React ecosystem, including support for hooks.

## The Impact

By using Formik, we expect to see a more manageable codebase as Formik abstracts away much of the complexity involved in form handling, validation, and state management. We also expect to see improved performance due to Formik's optimized validation system.
