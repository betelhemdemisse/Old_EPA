import caseService from "../../services/case.service.js";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import services from "../../services/penality.service.js";

const { PenaltyCategoryService } = services;

export default function DynamicFormPage() {
  const location = useLocation();
  const { reportSubmission, report_type_id, case_id } = location.state || {};
console.log("reportSubmission",reportSubmission)
  const [formFields, setFormFields] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [title, setTitle] = useState("");
  const [penalityList, setPenalityList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [closingAttachments, setClosingAttachments] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  const navigate = useNavigate();

const loadForm = async () => {
  try {
    const res = await caseService.getDynamicForm(report_type_id);
    if (!res?.status || !res.data?.reportingForm) return;

    const fields = res.data.reportingForm;

    setTitle(res.data.report_type || "Dynamic Form");
    setFormFields(fields);

    // Build empty defaults from schema
    const initialValues = fields.reduce((acc, field) => {
      acc[field.report_form_id] =
        field.input_type === "checkbox" ? [] : "";
      return acc;
    }, {});

    // Overwrite with submission values (update mode)
    const submissionValues = buildFormValuesFromSubmission(
      fields,
      reportSubmission
    );

    setFormValues({
      ...initialValues,
      ...submissionValues,
    });

    // Restore penalty subcategory
    if (reportSubmission?.penality_sub_category_id) {
      setSubcategoryId(reportSubmission.penality_sub_category_id);
    }
  } catch (error) {
    console.error("Error loading dynamic form", error);
  }
};

  const buildFormValuesFromSubmission = (fields, submission) => {
    if (!submission?.values || !fields?.length) return {};

    const valuesMap = {};
    submission.values.forEach(item => {
      const field = fields.find(f => f.report_form_id === item.report_form_id);
      if (!field) return;

      valuesMap[item.report_form_id] =
        field.input_type === "checkbox"
          ? item.value?.split(",").map(v => v.trim()) || []
          : item.value ?? "";
    });

    return valuesMap;
  };

useEffect(() => {
  if (report_type_id && reportSubmission) {
    loadForm();
  }
}, [report_type_id, reportSubmission]);

  // Group fields by type
  const { groupedFields, sectionKeys } = React.useMemo(() => {
    const grouped = formFields.reduce((acc, field) => {
      const type = field.formType?.form_type || "Other";
      if (!acc[type]) acc[type] = { name: type, fields: [], collapsed: false };
      acc[type].fields.push(field);
      return acc;
    }, {});
    return { groupedFields: grouped, sectionKeys: Object.keys(grouped) };
  }, [formFields]);

const totalSteps = Math.max(sectionKeys.length, 1);

  const handleChange = (id, value, isCheckbox = false) => {
    setFormValues(prev => {
      if (isCheckbox) {
        const current = prev[id] || [];
        const exists = current.includes(value);
        return { ...prev, [id]: exists ? current.filter(v => v !== value) : [...current, value] };
      }
      return { ...prev, [id]: value };
    });
  };

  const fetchCategories = async () => {
    const result = await PenaltyCategoryService.getAllPenaltyCategories();
    if (result) setPenalityList(result);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCategoryChange = e => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setSubcategoryId("");
  };

  const handleSubcategoryChange = e => {
    const selectedValue = e.target.value;
    setSelectedSubcategory(selectedValue);

    if (selectedValue) {
      const subcategories = getSubcategories();
      const foundSubcategory = subcategories.find(sub => sub.issue_type === selectedValue);
      if (foundSubcategory) setSubcategoryId(foundSubcategory.penality_sub_category_id);
    } else {
      setSubcategoryId("");
    }
  };

  const getSubcategories = () => {
    if (!selectedCategory) return [];
    const category = penalityList.data?.find(item => item.penalty_id === selectedCategory);
    return category?.penalitySubCategory || [];
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "";
    const category = penalityList.data?.find(item => item.penalty_id === selectedCategory);
    return category?.penalty_name || "";
  };

  const toggleSection = sectionKey => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const isLastStep = currentStep === totalSteps - 1;
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      const values = Object.entries(formValues).map(([report_form_id, value]) => ({
        report_form_id,
        value: Array.isArray(value) ? value.join(", ") : value || ""
      }));

      formData.append("report_type_id", report_type_id);
      if (case_id) formData.append("case_id", case_id);
      formData.append("values", JSON.stringify(values));
      if (selectedCategory) formData.append("penalty_category_id", selectedCategory);
      if (subcategoryId) formData.append("penality_sub_category_id", subcategoryId);
      closingAttachments.forEach(file => formData.append("files", file));

      const res = await caseService.submitDynamicForm(formData);

      if (res?.status) {
        setToast({ open: true, message: "Report Submitted Successfully!", type: "success" });
        setTimeout(() => navigate("/expert_report_list"), 1000);
      }
    } catch (error) {
      setToast({ open: true, message: "Failed to submit report", type: "error" });
    }
  };

const renderField = field => {
  const value = formValues[field.report_form_id] || "";
  const isCheckbox = field.input_type === "checkbox";

  return (
    <div key={field.report_form_id} className={isCheckbox ? "col-span-2" : ""}>
      {field.report_form && (
        <label className="block mb-3">
          <span className="text-gray-800 font-medium text-base">
            {field.report_form}
          </span>
          {field.report_form?.includes("*") && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {/* TEXT & NUMBER */}
        {(field.input_type === "text" ||
          field.input_type === "number") && (
          <input
            type={field.input_type}
            placeholder={field.placeholder || `Enter ${field.report_form}`}
            value={value}
            onChange={e =>
              handleChange(field.report_form_id, e.target.value)
            }
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              bg-white text-gray-800 placeholder-gray-400
              focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
              transition-all duration-200"
          />
        )}

        {/* TEXTAREA */}
        {field.input_type === "textarea" && (
          <textarea
            placeholder={field.placeholder || ""}
            value={value}
            onChange={e =>
              handleChange(field.report_form_id, e.target.value)
            }
            rows={4}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              bg-white text-gray-800 placeholder-gray-400 resize-none
              focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
              transition-all duration-200"
          />
        )}

        {/* SELECT */}
        {field.input_type === "select" && (
          <select
            value={value}
            onChange={e =>
              handleChange(field.report_form_id, e.target.value)
            }
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              bg-white text-gray-800
              focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
              transition-all duration-200"
          >
            <option value="" className="text-gray-400">
              {field.placeholder || "-- Select --"}
            </option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {/* RADIO */}
        {field.input_type === "radio" && (
          <div className="space-y-2 mt-2">
            {field.options?.map(option => (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.report_form_id}
                  value={option}
                  checked={value === option}
                  onChange={e =>
                    handleChange(field.report_form_id, e.target.value)
                  }
                  className="hidden"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      value === option
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                >
                  {value === option && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* DATE */}
        {field.input_type === "date" && (
          <input
            type="date"
            value={value}
            max={new Date().toISOString().split("T")[0]}
            onChange={e =>
              handleChange(field.report_form_id, e.target.value)
            }
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              bg-white text-gray-800
              focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
              transition-all duration-200"
          />
        )}

        {/* TIME */}
        {field.input_type === "time" && (
          <input
            type="time"
            value={value}
            onChange={e =>
              handleChange(field.report_form_id, e.target.value)
            }
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              bg-white text-gray-800
              focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
              transition-all duration-200"
          />
        )}

        {/* CHECKBOX */}
        {field.input_type === "checkbox" && (
          <div className="flex flex-wrap gap-3">
            {field.options?.map(option => {
              const selected = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    handleChange(field.report_form_id, option, true)
                  }
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                    flex items-center gap-2.5
                    ${
                      selected
                        ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center
                      ${
                        selected
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                  >
                    {selected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <ToastMessage open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {sectionKeys?.map((sectionKey, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const sectionName = groupedFields[sectionKey]?.name || sectionKey;

                    return (
                      <div key={sectionKey} className="flex items-center">
                        <button onClick={() => setCurrentStep(index)} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isActive ? "bg-green-600 text-white shadow-lg shadow-green-200" : isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </button>
                        <span className={`ml-3 font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`}>{sectionName}</span>
                        {index < sectionKeys.length - 1 && <div className={`h-0.5 w-8 mx-4 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {sectionKeys[currentStep] && groupedFields[sectionKeys[currentStep]]?.fields?.map(renderField)}
                </div>

                {/* Penalty Section - Only on last step */}
                {isLastStep && penalityList.data && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Penalty Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-3">
                          <span className="text-gray-800 font-medium text-base">Penalty Category *</span>
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={handleCategoryChange}
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
                            bg-white text-gray-800
                            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
                            transition-all duration-200"
                          required
                        >
                          <option value="" className="text-gray-400">-- Select Category --</option>
                          {penalityList.data.map((penalty) => (
                            <option key={penalty.penalty_id} value={penalty.penalty_id}>
                              {penalty.penalty_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-3">
                          <span className="text-gray-800 font-medium text-base">Penalty Subcategory</span>
                        </label>
                        <select
                          value={selectedSubcategory}
                          onChange={handleSubcategoryChange}
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
                            bg-white text-gray-800 disabled:bg-gray-50 disabled:text-gray-400
                            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
                            transition-all duration-200"
                          disabled={!selectedCategory || getSubcategories().length === 0}
                        >
                          <option value="" className="text-gray-400">-- Select Subcategory --</option>
                          {getSubcategories().map((subcategory) => (
                            <option key={subcategory.penality_sub_category_id} value={subcategory.issue_type}>
                              {subcategory.issue_type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Closing Attachment - Only on last step */}
                {isLastStep && (
                  <div className="mt-8">
                    <label className="block mb-3">
                      <span className="text-gray-800 font-medium text-base">Closing Attachment</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setClosingAttachments(Array.from(e.target.files))}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-gray-600 mb-1">
                          <span className="text-green-600 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">Maximum file size: 50MB</p>
                      </label>
                    </div>
                    
                    {closingAttachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {closingAttachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="text-gray-700">{file.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                const newFiles = [...closingAttachments];
                                newFiles.splice(index, 1);
                                setClosingAttachments(newFiles);
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                  <button onClick={handlePrev} disabled={currentStep === 0} className={`px-8 py-3.5 rounded-xl font-medium transition-all duration-200 ${currentStep > 0 ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}>
                    Previous
                  </button>
                  {currentStep < totalSteps - 1 ? (
                    <button onClick={handleNext} className="px-8 py-3.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow">
                      Next Step
                    </button>
                  ) : (
                    <button onClick={handleSubmit} className="px-8 py-3.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow">
                      Submit Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
