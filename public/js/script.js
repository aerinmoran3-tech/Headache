// ============================================================
// ENHANCED RENTAL APPLICATION MANAGER (Supabase Version)
// ============================================================
class RentalApplication {
    constructor() {
        this.adminConfig = {
            allowlist: ['admin@choiceproperties.com', 'manager@choiceproperties.com']
        };
        this.config = {
            LOCAL_STORAGE_KEY: "choicePropertiesRentalApp",
            AUTO_SAVE_INTERVAL: 30000,
            MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
            SUPABASE_URL: window.location.hostname === 'localhost' ? "https://vvbjdsgisjfgwcjlzneq.supabase.co" : (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || "https://vvbjdsgisjfgwcjlzneq.supabase.co",
            SUPABASE_KEY: (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2Ympkc2dpc2pmZ3djamx6bmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzI5MTAsImV4cCI6MjA4NTQ0ODkxMH0.KAlxk8pX4gFcZjo8xCs0QkkMjmdOMm7NNRXDgkjKCGQ"
        };
        
        // Initialize Supabase if variables are available
        try {
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(this.config.SUPABASE_URL, this.config.SUPABASE_KEY);
            }
        } catch (e) {
            // Silence initialization errors in production
        }
        
        this.state = {
            currentSection: 1,
            isSubmitting: false,
            isOnline: true,
            lastSave: null,
            applicationId: null,
            formData: {}
        };
        
        this.initialize();
    }
    
    isAdmin(email) {
        return this.adminConfig.allowlist.includes(email?.toLowerCase());
    }

    initialize() {
        this.setupEventListeners();
        this.setupOfflineDetection();
        this.populateStaticData();
        this.setupRealTimeValidation();
        this.setupFileUploads();
        this.setupCoApplicants();
        this.setupConditionalFields();
        this.setupCharacterCounters();
        this.restoreSavedProgress();
        this.setupGeoapify();
        this.setupInputFormatting();
        this.setupLanguageToggle();
        
        console.log('Rental Application Manager Initialized with Supabase');
    }

    setupLanguageToggle() {
        const translations = {
            en: {
                langText: 'Español',
                trustText: 'Applications are processed securely using industry-standard practices.',
                timeEstimate: 'Estimated time: 15-20 minutes',
                propertyHeader: 'Property & Applicant Details',
                residencyHeader: 'Residency & Occupancy',
                employmentHeader: 'Employment & Income',
                financialHeader: 'Financial & References',
                reviewHeader: 'Review & Submit',
                requiredNote: 'Fields marked with * are required',
                propertyInfo: 'Property Information',
                propertyAddressLabel: 'Property Address Applying For',
                moveInLabel: 'Requested Move-in Date',
                leaseTermLabel: 'Desired Lease Term',
                selectTerm: 'Select term...',
                months6: '6 Months',
                months12: '12 Months (Standard)',
                months18: '18 Months',
                months24: '24 Months',
                monthToMonth: 'Month-to-month',
                primaryApplicantInfo: 'Primary Applicant Information',
                firstNameLabel: 'First Name',
                lastNameLabel: 'Last Name',
                emailLabel: 'Email Address',
                phoneLabel: 'Phone Number',
                dobLabel: 'Date of Birth',
                ssnLabel: 'Social Security Number (Optional)',
                ssnHint: 'Encrypted during transmission and stored securely',
                ssnDetailHint: 'Providing your SSN may help speed up identity and background verification when required by the property manager.',
                ssnPrivacyHint: 'SSN is encrypted and only accessible to authorized reviewers. We do not share this information without legal or screening requirements.',
                nextStep: 'Next Step',
                prevStep: 'Previous',
                currentResidence: 'Current Residence',
                currentAddressLabel: 'Current Address',
                residencyStartLabel: 'How long at this address?',
                rentAmountLabel: 'Current Rent/Mortgage Amount',
                reasonLeavingLabel: 'Reason for leaving',
                landlordNameLabel: 'Current Landlord Name',
                landlordPhoneLabel: 'Landlord Phone',
                occupantsPets: 'Occupants & Pets',
                totalOccupantsLabel: 'Number of total occupants (including children)',
                occupantNamesLabel: 'Names and ages of all other occupants',
                hasPetsLabel: 'Do you have any pets?',
                yes: 'Yes',
                no: 'No',
                petDetailsLabel: 'Pet details (type, breed, weight)',
                employmentHeaderTitle: 'Employment & Income',
                currentEmployment: 'Current Employment',
                employmentStatusLabel: 'Employment Status',
                selectStatus: 'Select status...',
                fullTime: 'Full-time',
                partTime: 'Part-time',
                selfEmployed: 'Self-employed',
                student: 'Student',
                retired: 'Retired',
                unemployed: 'Unemployed',
                employerLabel: 'Current Employer',
                jobTitleLabel: 'Job Title',
                employmentDurationLabel: 'How long at this job?',
                supervisorNameLabel: 'Supervisor Name',
                supervisorPhoneLabel: 'Teléfono del supervisor',
                incomeVerification: 'Income Verification',
                monthlyIncomeLabel: 'Gross Monthly Income',
                otherIncomeLabel: 'Other Monthly Income',
                incomeHint: 'Before taxes and deductions',
                otherIncomeHint: 'Alimony, disability, etc.',
                financialHeaderTitle: 'Financial & References',
                personalReferences: 'Personal References',
                referencesHint: 'Please provide two references who are not relatives',
                ref1NameLabel: 'Reference 1 Name (Required)',
                ref1PhoneLabel: 'Reference 1 Phone (Required)',
                ref2NameLabel: 'Reference 2 Name (Optional)',
                emergencyInfo: 'Emergency Contact',
                emergencyNameLabel: 'Contact Name',
                emergencyPhoneLabel: 'Contact Phone',
                reviewHeaderTitle: 'Review & Submit',
                appSummary: 'Application Summary',
                appFeeLabel: 'Application Fee:',
                appFeeHint: 'The application fee is non-refundable $50 and is required before your application can be reviewed.',
                nextStepsTitle: 'Next Steps Timeline',
                step1Title: 'Step 1: Submission & Confirmation Email (Instant)',
                step2Title: 'Step 2: Admin Review (2-3 Business Days)',
                step3Title: 'Step 3: Background & Credit Check (If Required)',
                step4Title: 'Step 4: Final Approval & Lease Signing',
                documentUpload: 'Document Upload (Optional)',
                dropZoneText: 'Drag and drop files here or click to browse',
                fileLimits: 'PDF, JPG, PNG (Max 10MB)',
                legalDeclaration: 'Legal Declaration',
                legalCertify: 'I certify that the information provided in this application is true and correct to the best of my knowledge. I understand that any false statements may be grounds for rejection of this application or termination of any subsequent lease.',
                legalAuthorize: 'I authorize Choice Properties to verify the information provided, including credit history, employment, and references. Background checks may use industry-standard providers like TransUnion or Experian where permitted.',
                termsAgreeLabel: 'I agree to the terms and conditions',
                submitBtn: 'Submit Application',
                submitting: 'Submitting...',
                processing: 'Processing',
                validating: 'Validating',
                submittingStep: 'Submitting',
                complete: 'Complete',
                submissionTitle: 'Submitting your application',
                submissionHint: 'Please do not close this window. This may take a few moments...',
                successTitle: 'Application Submitted Successfully!',
                successText: 'Thank you for choosing Choice Properties. Your application has been received and is being processed.',
                appId: 'Application ID:',
                whatNext: 'What Happens Next?',
                emailHint: 'You will receive a confirmation email shortly',
                reviewHint: 'We will review your application within 2-3 business days',
                contactHint: 'We may contact you for additional information',
                printBtn: 'Print Summary',
                newBtn: 'New Application',
                viewDashboard: 'View Dashboard',
                errorSendGrid: 'SendGrid not configured on server',
                errorGeneral: 'An error occurred while submitting the application',
                errorEmailSent: 'Email sent',
                errRequired: 'Required',
                errEmail: 'Invalid email',
                errPhone: 'Invalid phone',
                errAddress: 'Please enter the property address',
                errMoveInPast: 'Move-in date cannot be in the past.',
                errIncomeRatio: 'Warning: Monthly income is less than 2.5x the rent. This may affect approval.',
                msgEmailValid: 'Email address looks good.',
                msgPhoneVerified: 'Phone number verified.',
                msgDateSelected: 'Date selected.',
                msgIncomeMeets: 'Income meets standard requirements.'
            },
            es: {
                langText: 'English',
                trustText: 'Las solicitudes se procesan de forma segura utilizando prácticas estándar de la industria.',
                timeEstimate: 'Tiempo estimado: 15-20 minutos',
                propertyHeader: 'Detalles de la Propiedad y el Solicitante',
                residencyHeader: 'Residencia y Ocupación',
                employmentHeader: 'Empleo e Ingresos',
                financialHeader: 'Finanzas y Referencias',
                reviewHeader: 'Revisar y Enviar',
                requiredNote: 'Los campos marcados con * son obligatorios',
                propertyInfo: 'Información de la Propiedad',
                propertyAddressLabel: 'Dirección de la propiedad que solicita',
                moveInLabel: 'Fecha de mudanza solicitada',
                leaseTermLabel: 'Plazo de arrendamiento deseado',
                selectTerm: 'Seleccionar plazo...',
                months6: '6 Meses',
                months12: '12 Meses (Estándar)',
                months18: '18 Meses',
                months24: '24 Meses',
                monthToMonth: 'Mes a mes',
                primaryApplicantInfo: 'Información del Solicitante Principal',
                firstNameLabel: 'Nombre',
                lastNameLabel: 'Apellido',
                emailLabel: 'Correo Electrónico',
                phoneLabel: 'Número de Teléfono',
                dobLabel: 'Fecha de Nacimiento',
                ssnLabel: 'Número de Seguro Social (Opcional)',
                ssnHint: 'Encriptado durante la transmisión y almacenado de forma segura',
                ssnDetailHint: 'Proporcionar su SSN puede ayudar a acelerar la verificación de identidad y antecedentes cuando lo requiera el administrador de la propiedad.',
                ssnPrivacyHint: 'El SSN está encriptado y solo es accesible para revisores autorizados. No compartimos esta información sin requisitos legales o de selección.',
                nextStep: 'Siguiente Paso',
                prevStep: 'Anterior',
                currentResidence: 'Residencia Actual',
                currentAddressLabel: 'Dirección Actual',
                residencyStartLabel: '¿Cuánto tiempo en esta dirección?',
                rentAmountLabel: 'Monto actual de alquiler/hipoteca',
                reasonLeavingLabel: 'Razón para mudarse',
                landlordNameLabel: 'Nombre del propietario actual',
                landlordPhoneLabel: 'Teléfono del propietario',
                occupantsPets: 'Ocupantes y Mascotas',
                totalOccupantsLabel: 'Número total de ocupantes (incluyendo niños)',
                occupantNamesLabel: 'Nombres y edades de todos los demás ocupantes',
                hasPetsLabel: '¿Tiene mascotas?',
                yes: 'Sí',
                no: 'No',
                petDetailsLabel: 'Detalles de la mascota (tipo, raza, peso)',
                employmentHeaderTitle: 'Empleo e Ingresos',
                currentEmployment: 'Empleo Actual',
                employmentStatusLabel: 'Estado de Empleo',
                selectStatus: 'Seleccionar estado...',
                fullTime: 'Tiempo completo',
                partTime: 'Medio tiempo',
                selfEmployed: 'Trabajador independiente',
                student: 'Estudiante',
                retired: 'Jubilado',
                unemployed: 'Desempleado',
                employerLabel: 'Empleador Actual',
                jobTitleLabel: 'Título del puesto',
                employmentDurationLabel: '¿Cuánto tiempo en este trabajo?',
                supervisorNameLabel: 'Nombre del supervisor',
                supervisorPhoneLabel: 'Teléfono del supervisor',
                incomeVerification: 'Verificación de Ingresos',
                monthlyIncomeLabel: 'Ingreso Mensual Bruto',
                otherIncomeLabel: 'Otros Ingresos Mensuales',
                incomeHint: 'Antes de impuestos y deducciones',
                otherIncomeHint: 'Pensión alimenticia, discapacidad, etc.',
                financialHeaderTitle: 'Finanzas y Referencias',
                personalReferences: 'Referencias Personales',
                referencesHint: 'Por favor, proporcione dos referencias que no sean parientes',
                ref1NameLabel: 'Nombre de Referencia 1 (Obligatorio)',
                ref1PhoneLabel: 'Teléfono de Referencia 1 (Obligatorio)',
                ref2NameLabel: 'Nombre de Referencia 2 (Opcional)',
                emergencyInfo: 'Contacto de Emergencia',
                emergencyNameLabel: 'Nombre de Contacto',
                emergencyPhoneLabel: 'Teléfono de Contacto',
                reviewHeaderTitle: 'Revisar y Enviar',
                appSummary: 'Resumen de la Solicitud',
                appFeeLabel: 'Tarifa de Solicitud:',
                appFeeHint: 'La tarifa de solicitud es de $50 no reembolsables y se requiere antes de que su solicitud pueda ser revisada.',
                nextStepsTitle: 'Cronograma de Próximos Pasos',
                step1Title: 'Paso 1: Envío y correo de confirmación (Instantáneo)',
                step2Title: 'Paso 2: Revisión del administrador (2-3 días hábiles)',
                step3Title: 'Paso 3: Verificación de antecedentes y crédito (si es necesario)',
                step4Title: 'Paso 4: Aprobación final y firma del contrato',
                documentUpload: 'Carga de Documentos (Opcional)',
                dropZoneText: 'Arrastre y suelte archivos aquí o haga clic para buscar',
                fileLimits: 'PDF, JPG, PNG (Máx. 10 MB)',
                legalDeclaration: 'Declaración Legal',
                legalCertify: 'Certifico que la información proporcionada en esta solicitud es verdadera y correcta a mi mejor saber y entender. Entiendo que cualquier declaración falsa puede ser motivo de rechazo de esta solicitud o de terminación de cualquier contrato de arrendamiento posterior.',
                legalAuthorize: 'Autorizo a Choice Properties a verificar la información proporcionada, incluyendo historial crediticio, empleo y referencias. Las verificaciones de antecedentes pueden utilizar proveedores estándar de la industria como TransUnion o Experian donde esté permitido.',
                termsAgreeLabel: 'Acepto los términos y condiciones',
                submitBtn: 'Enviar Solicitud',
                submitting: 'Enviando...',
                processing: 'Procesando',
                validating: 'Validando',
                submittingStep: 'Enviando',
                complete: 'Completo',
                submissionTitle: 'Enviando su solicitud',
                submissionHint: 'Por favor, no cierre esta ventana. Esto puede tomar unos momentos...',
                successTitle: '¡Solicitud enviada con éxito!',
                successText: 'Gracias por elegir Choice Properties. Su solicitud ha sido recibida y está siendo procesada.',
                appId: 'ID de solicitud:',
                whatNext: '¿Qué sigue?',
                emailHint: 'Recibirá un correo de confirmación en breve',
                reviewHint: 'Revisaremos su solicitud en 2-3 días hábiles',
                contactHint: 'Podemos contactarlo para obtener información adicional',
                printBtn: 'Imprimir resumen',
                newBtn: 'Nueva solicitud',
                viewDashboard: 'Ver panel',
                errorSendGrid: 'SendGrid no está configurado en el servidor',
                errorGeneral: 'Ocurrió un error al enviar la solicitud',
                errorEmailSent: 'Correo electrónico enviado',
                errRequired: 'Campo obligatorio',
                errEmail: 'Correo electrónico inválido',
                errPhone: 'Teléfono inválido',
                errAddress: 'Por favor, ingrese la dirección',
                errMoveInPast: 'La fecha de mudanza no puede ser en el pasado',
                errIncomeRatio: 'Advertencia: El ingreso mensual es inferior a 2.5 veces el alquiler. Esto puede afectar la aprobación.',
                msgEmailValid: 'El correo electrónico se ve bien.',
                msgPhoneVerified: 'Teléfono verificado.',
                msgDateSelected: 'Fecha seleccionada.',
                msgIncomeMeets: 'El ingreso cumple con los requisitos estándar.'
            }
        };

        this.translations = translations;
        this.state.language = 'en';
        const btn = document.getElementById('langToggle');
        const text = document.getElementById('langText');
        
        if (btn && text) {
            btn.addEventListener('click', () => {
                this.state.language = this.state.language === 'en' ? 'es' : 'en';
                const t = translations[this.state.language];
                text.textContent = t.langText;
                
                // Full Page Translation
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (t[key]) {
                        // Check if it's a strongly tagged element (like Step titles)
                        if (el.tagName === 'SPAN' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'P') {
                            el.textContent = t[key];
                        } else {
                            el.textContent = t[key];
                        }
                    }
                });

                // Update placeholders and options if needed
                this.updateBilingualLabels(t);
                
                // Update specific informational hints and text
                const incomeHint = document.querySelector('.income-hint');
                if (incomeHint) incomeHint.textContent = t.incomeHint;
                const otherIncomeHint = document.querySelector('.other-income-hint');
                if (otherIncomeHint) otherIncomeHint.textContent = t.otherIncomeHint;
                const refHint = document.querySelector('.references-hint');
                if (refHint) refHint.textContent = t.referencesHint;
                const appFeeHint = document.querySelector('.app-fee-hint');
                if (appFeeHint) appFeeHint.textContent = t.appFeeHint;
                const ssnHint = document.querySelector('.ssn-hint');
                if (ssnHint) ssnHint.textContent = t.ssnHint;
                
                // Update step content in Section 5
                const step1Desc = document.querySelector('#step1-desc');
                if (step1Desc) step1Desc.textContent = t.step1Title;
                const step2Desc = document.querySelector('#step2-desc');
                if (step2Desc) step2Desc.textContent = t.step2Title;
                const step3Desc = document.querySelector('#step3-desc');
                if (step3Desc) step3Desc.textContent = t.step3Title;
                const step4Desc = document.querySelector('#step4-desc');
                if (step4Desc) step4Desc.textContent = t.step4Title;

                // Update dynamic text in the DOM for non-standard elements
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (t[key]) {
                        el.textContent = t[key];
                    }
                });

                // Update Headers
                document.querySelector('#section1 h2').innerHTML = `<i class="fas fa-home"></i> ${t.propertyHeader}`;
                document.querySelector('#section2 h2').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${t.residencyHeader}`;
                document.querySelector('#section3 h2').innerHTML = `<i class="fas fa-briefcase"></i> ${t.employmentHeader}`;
                document.querySelector('#section4 h2').innerHTML = `<i class="fas fa-list-ul"></i> ${t.financialHeader}`;
                document.querySelector('#section5 h2').innerHTML = `<i class="fas fa-check-double"></i> ${t.reviewHeader}`;
                
                this.saveProgress();
            });
        }
    }

    updateBilingualLabels(t) {
        // Section 1 Labels
        this.updateLabel('propertyAddress', t.propertyAddressLabel);
        this.updateLabel('requestedMoveIn', t.moveInLabel);
        this.updateLabel('desiredLeaseTerm', t.leaseTermLabel);
        this.updateLabel('firstName', t.firstNameLabel);
        this.updateLabel('lastName', t.lastNameLabel);
        this.updateLabel('email', t.emailLabel);
        this.updateLabel('phone', t.phoneLabel);
        this.updateLabel('dob', t.dobLabel);
        this.updateLabel('ssn', t.ssnLabel);
        
        // Section 2 Labels
        this.updateLabel('currentAddress', t.currentAddressLabel);
        this.updateLabel('residencyStart', t.residencyStartLabel);
        this.updateLabel('rentAmount', t.rentAmountLabel);
        this.updateLabel('reasonLeaving', t.reasonLeavingLabel);
        this.updateLabel('landlordName', t.landlordNameLabel);
        this.updateLabel('landlordPhone', t.landlordPhoneLabel);
        this.updateLabel('totalOccupants', t.totalOccupantsLabel);
        this.updateLabel('occupantNames', t.occupantNamesLabel);
        
        // Section 3 Labels
        this.updateLabel('employmentStatus', t.employmentStatusLabel);
        this.updateLabel('employer', t.employerLabel);
        this.updateLabel('jobTitle', t.jobTitleLabel);
        this.updateLabel('employmentDuration', t.employmentDurationLabel);
        this.updateLabel('supervisorName', t.supervisorNameLabel);
        this.updateLabel('supervisorPhone', t.supervisorPhoneLabel);
        this.updateLabel('monthlyIncome', t.monthlyIncomeLabel);
        this.updateLabel('otherIncome', t.otherIncomeLabel);
        
        // Section 4 Labels
        this.updateLabel('ref1Name', t.ref1NameLabel);
        this.updateLabel('ref1Phone', t.ref1PhoneLabel);
        this.updateLabel('ref2Name', t.ref2NameLabel);
        
        // Step titles
        const section2H3 = document.querySelector('#section2 h3');
        if (section2H3) section2H3.textContent = t.currentResidence;
        const section2OccupantsH3 = document.querySelectorAll('#section2 h3')[1];
        if (section2OccupantsH3) section2OccupantsH3.textContent = t.occupantsPets;
        
        const section3H3 = document.querySelector('#section3 h3');
        if (section3H3) section3H3.textContent = t.currentEmployment;
        const section3IncomeH3 = document.querySelectorAll('#section3 h3')[1];
        if (section3IncomeH3) section3IncomeH3.textContent = t.incomeVerification;
        
        const section4H3 = document.querySelector('#section4 h3');
        if (section4H3) section4H3.textContent = t.personalReferences;

        // Radio labels
        const petsLabel = document.querySelector('label[for="petsYes"]')?.parentElement?.previousElementSibling;
        if (petsLabel) petsLabel.textContent = t.hasPetsLabel;
        const yesLabel = document.querySelector('label[for="petsYes"]');
        if (yesLabel) yesLabel.textContent = t.yes;
        const noLabel = document.querySelector('label[for="petsNo"]');
        if (noLabel) noLabel.textContent = t.no;

        // Select Options
        const leaseSelect = document.getElementById('desiredLeaseTerm');
        if (leaseSelect) {
            leaseSelect.options[0].textContent = t.selectTerm;
            leaseSelect.options[1].textContent = t.months6;
            leaseSelect.options[2].textContent = t.months12;
            leaseSelect.options[3].textContent = t.months18;
            leaseSelect.options[4].textContent = t.months24;
            leaseSelect.options[5].textContent = t.monthToMonth;
        }

        const empSelect = document.getElementById('employmentStatus');
        if (empSelect) {
            empSelect.options[0].textContent = t.selectStatus;
            empSelect.options[1].textContent = t.fullTime;
            empSelect.options[2].textContent = t.partTime;
            empSelect.options[3].textContent = t.selfEmployed;
            empSelect.options[4].textContent = t.student;
            empSelect.options[5].textContent = t.retired;
            empSelect.options[6].textContent = t.unemployed;
        }

        // Buttons
        document.querySelectorAll('.btn-next').forEach(b => {
            const icon = b.querySelector('i');
            b.innerHTML = `${t.nextStep} `;
            if (icon) b.appendChild(icon);
        });
        document.querySelectorAll('.btn-prev').forEach(b => {
            const icon = b.querySelector('i');
            b.innerHTML = '';
            if (icon) b.appendChild(icon);
            b.appendChild(document.createTextNode(` ${t.prevStep}`));
        });
        
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) submitBtn.textContent = t.submitBtn;
    }

    updateLabel(id, text) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
            const isRequired = label.classList.contains('required');
            label.textContent = text;
            if (isRequired) label.classList.add('required');
        } else {
            // Fallback for fields without for/id match (like radio groups)
            const input = document.getElementById(id);
            if (input && input.type === 'radio') {
                const groupLabel = input.closest('.form-group')?.querySelector('label');
                if (groupLabel) groupLabel.textContent = text;
            }
        }
    }

    setupGeoapify() {
        const apiKey = "bea2afb13c904abea5cb2c2693541dcf";
        const fields = ['propertyAddress', 'currentAddress'];
        
        fields.forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;

            const container = document.createElement('div');
            container.style.position = 'relative';
            input.parentNode.insertBefore(container, input);
            container.appendChild(input);

            const dropdown = document.createElement('div');
            dropdown.className = 'autocomplete-dropdown';
            dropdown.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; z-index: 1000; display: none; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 4px;';
            container.appendChild(dropdown);

            input.addEventListener('input', this.debounce(async (e) => {
                const text = e.target.value;
                if (text.length < 3) {
                    dropdown.style.display = 'none';
                    return;
                }

                try {
                    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${apiKey}`);
                    const data = await response.json();
                    
                    if (data.features && data.features.length > 0) {
                        dropdown.innerHTML = '';
                        data.features.forEach(feature => {
                            const item = document.createElement('div');
                            item.style.cssText = 'padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 14px;';
                            item.textContent = feature.properties.formatted;
                            item.addEventListener('mouseover', () => item.style.background = '#f0f7ff');
                            item.addEventListener('mouseout', () => item.style.background = 'white');
                            item.addEventListener('click', () => {
                                input.value = feature.properties.formatted;
                                dropdown.style.display = 'none';
                                // Auto-save after selection
                                this.saveProgress();
                            });
                            dropdown.appendChild(item);
                        });
                        dropdown.style.display = 'block';
                    } else {
                        dropdown.style.display = 'none';
                    }
                } catch (err) {
                    console.error('Geoapify error:', err);
                }
            }, 300));

            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) dropdown.style.display = 'none';
            });
        });
    }

    setupInputFormatting() {
        const phoneFields = ['phone', 'landlordPhone', 'supervisorPhone', 'ref1Phone', 'ref2Phone', 'emergencyPhone'];
        phoneFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
                });
            }
        });

        const ssnEl = document.getElementById('ssn');
        if (ssnEl) {
            ssnEl.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 9) val = val.substring(0, 9);
                let formatted = '';
                if (val.length > 0) formatted += val.substr(0, 3);
                if (val.length > 3) formatted += '-' + val.substr(3, 2);
                if (val.length > 5) formatted += '-' + val.substr(5, 4);
                e.target.value = formatted;
            });
        }
    }
    
    // =================== EVENT HANDLERS ===================
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-next') || e.target.closest('.btn-next')) {
                const section = this.getCurrentSection();
                this.nextSection(section);
            }
            if (e.target.matches('.btn-prev') || e.target.closest('.btn-prev')) {
                const section = this.getCurrentSection();
                this.previousSection(section);
            }
        });
        
        // Start Over
        const startOverBtn = document.getElementById('startOverBtn');
        if (startOverBtn) {
            startOverBtn.addEventListener('click', () => {
                if (confirm('This will clear all entered information. Are you sure you want to start over?')) {
                    this.clearSavedProgress();
                    location.reload();
                }
            });
        }
        
        // Auto-save on input
        document.addEventListener('input', (e) => {
            // Don't save SSN
            if (e.target.id === 'ssn') return;
            this.debounce(() => {
                this.saveProgress();
            }, 1000)();
        });
        
        // Form submission handler
        const form = document.getElementById('rentalApplication');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // SSN Toggle
        const ssnToggle = document.getElementById('ssnToggle');
        if (ssnToggle) {
            ssnToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ssnInput = document.getElementById('ssn');
                if (ssnInput.type === 'password') {
                    ssnInput.type = 'text';
                    ssnToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    ssnInput.type = 'password';
                    ssnToggle.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate all sections
        for (let i = 1; i <= 5; i++) {
            if (!this.validateSection(i)) {
                this.showSection(i);
                this.updateProgressBar();
                return;
            }
        }
        
        // Show loading state on button
        const submitBtn = document.getElementById('mainSubmitBtn');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }

        this.setState({ isSubmitting: true });
        this.showSubmissionProgress();
        
        try {
            this.updateSubmissionProgress(1, 'Processing your information...');
            await this.delay(1000);
            
            this.updateSubmissionProgress(2, 'Validating application data...');
            await this.delay(800);
            
            this.updateSubmissionProgress(3, 'Preparing submission...');
            
            // 1. Generate unique application_id (timestamp + random suffix)
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const applicationId = `CP-${timestamp}-${randomSuffix}`;
            this.state.applicationId = applicationId;
            
            document.getElementById('formApplicationId').value = applicationId;
            
            this.updateSubmissionProgress(4, 'Submitting application to Choice Properties database...');
            
            const formData = this.getAllFormData();
            // Securely remove sensitive/duplicate data before saving
            delete formData.ssn;
            delete formData.SSN;

            // 2. Insert record into Supabase table 'rental_applications'
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('rental_applications')
                    .insert([
                        { 
                            application_id: applicationId,
                            form_data: formData,
                            property_address: formData.propertyAddress,
                            applicant_email: formData.email,
                            applicant_name: `${formData.firstName} ${formData.lastName}`,
                            application_status: 'awaiting_payment',
                            payment_status: 'pending'
                        }
                    ]);

                if (error) throw error;
            } else {
                throw new Error('Database service not initialized');
            }
            
            // 3. Log success
            console.log('Application submitted successfully:', applicationId);
            
            this.handleSubmissionSuccess(applicationId);
            
            // 4. Trigger Email Notification via Supabase Edge Function
            if (this.supabase) {
                console.log('Attempting to trigger email for application:', applicationId);
                this.supabase.functions.invoke('send-email', {
                    body: { 
                        application_id: applicationId,
                        applicant_email: formData.email,
                        applicant_name: `${formData.firstName} ${formData.lastName}`,
                        status: 'awaiting_payment'
                    }
                }).then(({ data, error }) => {
                    if (error) {
                        console.error('Email trigger error:', error);
                    } else {
                        console.log('Email trigger response:', data);
                    }
                }).catch(err => {
                    console.error('Email trigger exception:', err);
                });
            }
            
        } catch (error) {
            // 4. Log error
            console.error('Submission error:', error);
            // Hide loading state on button
            const submitBtn = document.getElementById('mainSubmitBtn');
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
            this.setState({ isSubmitting: false });
            this.hideSubmissionProgress();
            alert(`Submission failed: ${error.message}`);
        }
    }
    
    async sendConfirmationEmail(formData) {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: formData.email,
                    subject: 'Application Received - Choice Properties',
                    content: `
                        <h3>Thank you for your application!</h3>
                        <p>Hi ${formData.firstName},</p>
                        <p>We have received your rental application for <strong>${formData.propertyAddress}</strong>.</p>
                        <p>Our team will review your information and get back to you within 2-3 business days.</p>
                        <p>Best regards,<br>Choice Properties Management</p>
                    `
                })
            });
            const result = await response.json();
            console.log('Email API response:', result);
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
        }
    }

    handleSubmissionSuccess(applicationId) {
        this.updateSubmissionProgress(4, 'Submission complete!');
        this.hideSubmissionProgress();
        this.showSuccessState(applicationId);
        this.clearSavedProgress();
        // Removed FormSubmit auto-submit logic
    }
    
    handleSubmissionError(error) {
        let userMessage = 'We encountered an error while processing your application.';
        const errorMsgEl = document.getElementById('errorMessage');
        if (errorMsgEl) errorMsgEl.textContent = userMessage;
        this.hideSubmissionProgress();
        this.showElement('errorState');
    }
    
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.setState({ isOnline: true });
        });
        
        window.addEventListener('offline', () => {
            this.setState({ isOnline: false });
        });
        
        this.setState({ isOnline: navigator.onLine });
    }
    
    // =================== STATE MANAGEMENT ===================
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUIState();
    }
    
    updateUIState() {
        const offlineIndicator = document.getElementById('offlineIndicator');
        if (offlineIndicator) {
            offlineIndicator.style.display = this.state.isOnline ? 'none' : 'block';
        }
    }
    
    getCurrentSection() {
        const activeSection = document.querySelector('.form-section.active');
        return activeSection ? parseInt(activeSection.id.replace('section', '')) : 1;
    }
    
    // =================== SECTION NAVIGATION ===================
    nextSection(currentSection) {
        if (!this.validateSection(currentSection)) {
            return;
        }
        
        this.hideSection(currentSection);
        this.showSection(currentSection + 1);
        this.updateProgressBar();
        
        if (currentSection + 1 === 5) {
            this.generateApplicationSummary();
            this.generateApplicationId();
        }
    }
    
    previousSection(currentSection) {
        if (currentSection > 1) {
            this.hideSection(currentSection);
            this.showSection(currentSection - 1);
            this.updateProgressBar();
        }
    }
    
    hideSection(sectionNumber) {
        const section = document.getElementById(`section${sectionNumber}`);
        if (section) section.classList.remove('active');
    }
    
    showSection(sectionNumber) {
        const section = document.getElementById(`section${sectionNumber}`);
        if (section) {
            section.classList.add('active');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    updateProgressBar() {
        const currentSection = this.getCurrentSection();
        const progress = ((currentSection - 1) / 4) * 100;
        const progressFill = document.getElementById('progressFill');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.classList.remove('active', 'completed');
                if (i < currentSection) step.classList.add('completed');
                if (i === currentSection) step.classList.add('active');
            }
        }
    }
    
    // =================== VALIDATION ===================
    validateSection(sectionNumber) {
        const requiredFields = this.getRequiredFieldsForSection(sectionNumber);
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const fieldValid = this.validateField(field);
                if (!fieldValid) isValid = false;
                this.showFieldError(field, !fieldValid);
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const t = this.getTranslations();
        const value = field.value.trim();
        const parent = field.parentElement;
        let helpText = parent.querySelector('.field-help-feedback');
        
        if (!helpText) {
            helpText = document.createElement('div');
            helpText.className = 'field-help-feedback';
            helpText.style.fontSize = '12px';
            helpText.style.marginTop = '4px';
            parent.appendChild(helpText);
        }

        if (field.required && !value) {
            this.updateFieldFeedback(field, helpText, t.errRequired || 'Required', 'invalid');
            return false;
        }
        
        if (value && field.type === 'email') {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (!isValid) {
                this.updateFieldFeedback(field, helpText, t.errEmail || 'Invalid email', 'invalid');
                return false;
            }
            this.updateFieldFeedback(field, helpText, t.msgEmailValid || 'Email address looks good.', 'valid');
        }

        if (value && field.type === 'tel') {
            const isValid = value.replace(/\D/g, '').length >= 10;
            if (!isValid) {
                this.updateFieldFeedback(field, helpText, t.errPhone || 'Invalid phone', 'invalid');
                return false;
            }
            this.updateFieldFeedback(field, helpText, t.msgPhoneVerified || 'Phone number verified.', 'valid');
        }
        
        // Move-in date validation
        if (field.id === 'requestedMoveIn' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                this.updateFieldFeedback(field, helpText, t.errMoveInPast || 'Move-in date cannot be in the past.', 'invalid');
                return false;
            }
            this.updateFieldFeedback(field, helpText, t.msgDateSelected || 'Date selected.', 'valid');
        }

        // Rent vs Income Consistency Check
        if (field.id === 'monthlyIncome' && value) {
            const income = parseFloat(value.replace(/[^0-9.]/g, ''));
            const rent = parseFloat(document.getElementById('rentAmount')?.value.replace(/[^0-9.]/g, '')) || 0;
            if (income > 0 && rent > 0) {
                const ratio = income / rent;
                if (ratio < 2.5) {
                    this.updateFieldFeedback(field, helpText, t.errIncomeRatio || 'Warning: Monthly income is less than 2.5x the rent.', 'invalid');
                } else {
                    this.updateFieldFeedback(field, helpText, t.msgIncomeMeets || 'Income meets standard requirements.', 'valid');
                }
            }
        }
        
        this.updateFieldFeedback(field, helpText, '', 'none');
        return true;
    }

    updateFieldFeedback(field, helpElement, message, status) {
        helpElement.textContent = message;
        helpElement.style.display = message ? 'block' : 'none';
        
        if (status === 'invalid') {
            helpElement.style.color = 'var(--danger)';
            field.classList.add('error');
        } else if (status === 'valid') {
            helpElement.style.color = 'var(--success)';
            field.classList.remove('error');
        } else {
            field.classList.remove('error');
        }
    }
    
    showFieldError(field, hasError) {
        const t = this.getTranslations();
        if (hasError) {
            field.classList.add('error');
            const errorMsg = field.parentElement.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = t.errRequired || 'Required';
            }
        } else {
            field.classList.remove('error');
            const errorMsg = field.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.style.display = 'none';
        }
    }

    getTranslations() {
        return this.translations[this.state.language] || this.translations['en'];
    }
    
    getRequiredFieldsForSection(sectionNumber) {
        const fields = {
            1: ['propertyAddress', 'requestedMoveIn', 'desiredLeaseTerm', 'firstName', 'lastName', 'email', 'phone', 'dob'],
            2: ['currentAddress', 'residencyStart', 'rentAmount', 'reasonLeaving', 'landlordName', 'landlordPhone'],
            3: ['employmentStatus', 'employer', 'jobTitle', 'employmentDuration', 'supervisorName', 'supervisorPhone', 'monthlyIncome'],
            4: ['ref1Name', 'ref1Phone', 'emergencyName', 'emergencyPhone'],
            5: ['termsAgree']
        };
        return fields[sectionNumber] || [];
    }
    
    // =================== HELPERS ===================
    getElement(id) { return document.getElementById(id); }
    showElement(id) { const el = this.getElement(id); if (el) el.style.display = 'block'; }
    hideElement(id) { const el = this.getElement(id); if (el) el.style.display = 'none'; }
    
    delay(ms) { return new Promise(res => setTimeout(res, ms)); }
    
    generateApplicationId() {
        const timestamp = Date.now();
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `CP-${timestamp}-${randomChars}`;
    }
    
    generateApplicationSummary() {
        const summaryContainer = document.getElementById('applicationSummary');
        if (!summaryContainer) return;

        const form = document.getElementById('rentalApplication');
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (value && key !== 'SSN' && key !== 'Application ID') {
                data[key] = value;
            }
        });

        // Group the data for a cleaner summary
        const groups = [
            { id: 1, name: 'Property & Applicant', fields: ['Property Address', 'Requested Move-in Date', 'Desired Lease Term', 'First Name', 'Last Name', 'Email', 'Phone', 'DOB'] },
            { id: 2, name: 'Residency', fields: ['Current Address', 'Residency Duration', 'Current Rent Amount', 'Reason for leaving', 'Current Landlord Name', 'Landlord Phone'] },
            { id: 2, name: 'Occupancy', fields: ['Total Occupants', 'Additional Occupants', 'Has Pets', 'Pet Details'] },
            { id: 3, name: 'Employment & Income', fields: ['Employment Status', 'Employer', 'Job Title', 'Employment Duration', 'Supervisor Name', 'Supervisor Phone', 'Monthly Income', 'Other Income'] },
            { id: 4, name: 'Financial & References', fields: ['Bank Name', 'Account Type', 'Emergency Contact Name', 'Emergency Contact Phone', 'Personal Reference 1', 'Reference 1 Phone', 'Personal Reference 2', 'Reference 2 Phone'] }
        ];

        let summaryHtml = '';
        groups.forEach(group => {
            let groupFieldsHtml = '';
            group.fields.forEach(field => {
                const value = data[field];
                if (value) {
                    groupFieldsHtml += `
                        <div class="summary-item">
                            <div class="summary-label">${field}</div>
                            <div class="summary-value">${value}</div>
                        </div>`;
                }
            });

            if (groupFieldsHtml) {
                summaryHtml += `
                    <div class="summary-group">
                        <div class="summary-header">
                            <span>${group.name}</span>
                            <button type="button" class="btn-text" onclick="window.app.goToSection(${group.id})" style="font-size: 12px; color: var(--secondary); padding: 4px 8px;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                        <div class="summary-content">
                            ${groupFieldsHtml}
                        </div>
                    </div>`;
            }
        });

        summaryContainer.innerHTML = summaryHtml;
    }

    goToSection(sectionNumber) {
        this.hideSection(this.getCurrentSection());
        this.showSection(sectionNumber);
        this.updateProgressBar();
    }
    
    getAllFormData() {
        const form = document.getElementById('rentalApplication');
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        // Also capture by ID for elements that might not have name exactly matching ID
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id) data[input.id] = input.type === 'checkbox' ? input.checked : input.value;
        });
        return data;
    }
    
    // =================== STUBS FOR MISSING METHODS ===================
    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Validate on blur as before
            input.addEventListener('blur', () => this.validateField(input));
            
            // For immediate correction: 
            // If the field already has an error class, validate on every input
            // Otherwise, use the debounced validation to avoid flickering
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                } else {
                    // Debounce logic if not already in error state
                    if (this.validationTimeout) clearTimeout(this.validationTimeout);
                    this.validationTimeout = setTimeout(() => {
                        if (input.value.trim().length > 0) {
                            this.validateField(input);
                        }
                    }, 800);
                }
            });
        });
    }
    setupFileUploads() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', () => {
                const list = document.getElementById('fileList');
                list.innerHTML = Array.from(fileInput.files).map(f => `<div class="file-item">${f.name}</div>`).join('');
            });
        }
    }
    setupCoApplicants() {}
    setupConditionalFields() {
        const petsRadio = document.getElementsByName('Has Pets');
        const petGroup = document.getElementById('petDetailsGroup');
        if (petsRadio && petGroup) {
            petsRadio.forEach(r => r.addEventListener('change', (e) => {
                petGroup.style.display = e.target.value === 'Yes' ? 'block' : 'none';
            }));
        }
    }
    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const parent = textarea.parentElement;
            const counter = document.createElement('div');
            counter.className = 'character-count';
            counter.style.fontSize = '11px';
            counter.style.textAlign = 'right';
            counter.style.color = '#7f8c8d';
            parent.appendChild(counter);

            const updateCounter = () => {
                const len = textarea.value.length;
                const max = textarea.getAttribute('maxlength') || 500;
                counter.textContent = `${len}/${max} characters`;
            };

            textarea.addEventListener('input', updateCounter);
            updateCounter();
        });
    }
    populateStaticData() {}
    
    restoreSavedProgress() {
        const saved = localStorage.getItem(this.config.LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                // Simple restore logic
                const form = document.getElementById('rentalApplication');
                Object.keys(data).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) {
                        if (el.type === 'checkbox') el.checked = data[key];
                        else el.value = data[key];
                    }
                });
            } catch (e) {}
        }
    }
    
    startAutoSave() {
        // Debounced save on any input change
        document.addEventListener('input', this.debounce((e) => {
            if (e.target.id !== 'ssn') {
                this.saveProgress();
            }
        }, 1000));
        
        // Background interval as fallback
        setInterval(() => this.saveProgress(), this.config.AUTO_SAVE_INTERVAL);
    }
    
    saveProgress() {
        const data = this.getAllFormData();
        // SECURE: Explicitly sanitize sensitive data from persistent storage
        // SSN is only kept in memory during the session, never written to disk
        const sensitiveKeys = ['SSN', 'ssn', 'social_security', 'Social Security'];
        sensitiveKeys.forEach(key => delete data[key]);
        
        // Add session recovery metadata
        data._last_updated = new Date().toISOString();
        data._language = this.state.language || 'en';
        
        localStorage.setItem(this.config.LOCAL_STORAGE_KEY, JSON.stringify(data));
        this.showAutoSaveIndicator();
    }
    
    showAutoSaveIndicator() {
        // Silent save: indicator functionality disabled to avoid distractions
        return;
    }
    
    queueSave() { this.saveProgress(); }
    
    debounce(func, wait) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), wait);
        };
    }
    
    updateSubmissionProgress(step, message) {
        const msg = document.getElementById('submissionMessage');
        if (msg) msg.textContent = message;
        for (let i = 1; i <= 4; i++) {
            const ind = document.getElementById(`step${i}Indicator`);
            if (ind) {
                ind.classList.remove('active', 'completed');
                if (i < step) ind.classList.add('completed');
                if (i === step) ind.classList.add('active');
            }
        }
    }
    
    showSubmissionProgress() { this.showElement('submissionProgress'); this.hideSection(this.getCurrentSection()); }
    hideSubmissionProgress() { this.hideElement('submissionProgress'); }
    showSuccessState(appId) {
        this.showElement('successState');
        const el = document.getElementById('successAppId');
        if (el) el.textContent = appId;
        
        // QR Code Generation
        const qrContainer = document.getElementById('qrcode');
        if (qrContainer && typeof QRCode !== 'undefined') {
            qrContainer.innerHTML = '';
            try {
                new QRCode(qrContainer, {
                    text: `${window.location.origin}/dashboard/?id=${appId}`,
                    width: 120,
                    height: 120,
                    colorDark : "#2563eb",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } catch (err) {
                console.error('QR generation failed:', err);
            }
        }
    }
    clearSavedProgress() { localStorage.removeItem(this.config.LOCAL_STORAGE_KEY); }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RentalApplication();
    // Ensure section 1 is active
    const s1 = document.getElementById('section1');
    if (s1) s1.classList.add('active');
});
