"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  pregnant: boolean;
  phone_number: string;
  birthday: Date;
  blood_test: string;
  last_dentist_appointment: Date;
  gum_pain: boolean;
  gum_bleed: boolean;
  bad_breath: boolean;
  loose_teeth: boolean;
  pus_white_discharge: boolean;
  gum_recession: boolean;
  teeth_longer: boolean;
  gap_form: boolean;
  smoker: boolean;
  alcohol: boolean;
  tooth_pain: boolean;
  sensitivity: boolean;
  toothbrush: string;
  toothpaste: string;
  mouthwash: boolean;
  ulcer: boolean;
  diet: boolean;
  diet_type: string;
  smoker_type: string;
  alcohol_type: string;
  inflammation: boolean;
  teeth_removed: boolean;
  fillings: boolean;
  root_canals: boolean;
  weekly_floss_frequency: number;
  weekly_daily_brush: boolean;
  analysis_result: AnalysisResult;
  last_analysis: Date;
  photo_analyzed: string;
}

interface AnalysisResult {
  score: number;
  analysis: string;
  causes: string[];
  suggestions: string[];
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<PatientProfile>();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(
    null
  );
  const [parsedResult, setParsedResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error(profileError?.message || "Profile not found");
        router.push("/login");
        return;
      }

      if (!profile.is_dentist) {
        alert("Access denied. Not a dentist.");
        router.push("/login");
        return;
      }

      // Fetch assigned patient IDs
      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignment")
        .select("patient_id")
        .eq("dentist_id", user.id);

      if (assignmentsError) {
        console.error("Error loading assignments:", assignmentsError.message);
        return;
      }

      const patientIds = assignments.map((a) => a.patient_id);

      if (patientIds.length === 0) {
        console.log("No assigned patients");
        setLoading(false);
        return;
      }

      // Fetch patient profiles
      const { data: patientProfiles, error: patientsError } = await supabase
        .from("profile")
        .select("*")
        .in("id", patientIds);

      if (patientsError) {
        console.error("Error loading patients:", patientsError.message);
      } else {
        setPatients(patientProfiles);
        setProfile(profile);
      }

      setLoading(false);
    }
    loadProfile();
  }, [router]);

  useEffect(() => {
    if (selectedPatient?.analysis_result) {
      try {
        setParsedResult(selectedPatient.analysis_result);
      } catch (error) {
        console.error("Failed to parse analysis result", error);
        setParsedResult(null);
      }
    } else {
      setParsedResult(null);
    }
  }, [selectedPatient]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dentist Dashboard</h1>
      <p className="mb-8 text-gray-600">
        Welcome, {profile?.first_name} {profile?.last_name}!
      </p>

      {patients.length === 0 ? (
        <p className="text-gray-600">No patients assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side: Patient list */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Patients</h2>
            <div className="flex flex-col gap-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`text-left p-2 rounded-md hover:bg-primary/20 ${
                    selectedPatient?.id === patient.id ? "bg-primary/10" : ""
                  }`}
                >
                  <p className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Selected patient profile */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            {selectedPatient ? (
              <div className="flex flex-col gap-4">
                {/* GENERAL INFORMATION */}
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h2>
                  <p className="text-sm">{selectedPatient.phone_number}</p>
                  <p>{selectedPatient.gender}</p>
                  <p className="text-sm">
                    DOB:{" "}
                    {new Date(selectedPatient.birthday).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                </div>

                {/* DOCUMENTS */}
                <h2 className="font-bold">Patient Dental Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Last Dentist Appointment:
                    </p>
                    <p className="font-medium">
                      {selectedPatient.last_dentist_appointment
                        ? new Date(
                            selectedPatient.last_dentist_appointment
                          ).toLocaleDateString("en-GB")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Blood Test:</p>
                    <p className="font-medium">
                      {selectedPatient.blood_test ? (
                        <a href={selectedPatient.blood_test}>View Blood Test</a>
                      ) : (
                        "Not Uploaded"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Smoker:</p>
                    <p className="font-medium">
                      {selectedPatient.smoker ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Smoking Habit:</p>
                    <p className="font-medium">
                      {selectedPatient.smoker_type
                        ? selectedPatient.smoker_type
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Drinking:</p>
                    <p className="font-medium">
                      {selectedPatient.alcohol ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Drinking Habit:</p>
                    <p className="font-medium">
                      {selectedPatient.alcohol_type
                        ? selectedPatient.alcohol_type
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Diet:</p>
                    <p className="font-medium">
                      {selectedPatient.diet ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Diet Habit:</p>
                    <p className="font-medium">
                      {selectedPatient.diet_type
                        ? selectedPatient.diet_type
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* GUM RELATED ISSUES */}
                <h2 className="font-bold">Gum Related Issues</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Gum Pain:</p>
                    <p className="font-medium">
                      {selectedPatient.gum_pain ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Gum Bleed:</p>
                    <p className="font-medium">
                      {selectedPatient.gum_bleed ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Gum Recession:</p>
                    <p className="font-medium">
                      {selectedPatient.gum_recession ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      Pus/White Discharges:
                    </p>
                    <p className="font-medium">
                      {selectedPatient.pus_white_discharge ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Bad Breath:</p>
                    <p className="font-medium">
                      {selectedPatient.bad_breath ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Loose Teeth:</p>
                    <p className="font-medium">
                      {selectedPatient.loose_teeth ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Teeth Looks Longer:</p>
                    <p className="font-medium">
                      {selectedPatient.teeth_longer ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Teeth Gap Forming:</p>
                    <p className="font-medium">
                      {selectedPatient.gap_form ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Tooth Pain:</p>
                    <p className="font-medium">
                      {selectedPatient.tooth_pain ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Ulcer:</p>
                    <p className="font-medium">
                      {selectedPatient.ulcer ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Inflammation:</p>
                    <p className="font-medium">
                      {selectedPatient.inflammation ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Sensitive Teeth:</p>
                    <p className="font-medium">
                      {selectedPatient.sensitivity ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* HYGIENE RELATED */}
                <h2 className="font-bold">Patient Oral Hygiene</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Toothbrush:</p>
                    <p className="font-medium">
                      {selectedPatient.toothbrush
                        ? selectedPatient.toothbrush
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Toothpaste:</p>
                    <p className="font-medium">
                      {selectedPatient.toothpaste
                        ? selectedPatient.toothpaste
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Mouthwash:</p>
                    <p className="font-medium">
                      {selectedPatient.mouthwash ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      Floss Frequency per Week
                    </p>
                    <p className="font-medium">
                      {selectedPatient.weekly_floss_frequency
                        ? selectedPatient.weekly_floss_frequency
                        : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Brush Daily</p>
                    <p className="font-medium">
                      {selectedPatient.weekly_daily_brush ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* SURGERY RELATED */}
                <h2 className="font-bold">Patient Past Surgery</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Fillings:</p>
                    <p className="font-medium">
                      {selectedPatient.fillings ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Root Canal:</p>
                    <p className="font-medium">
                      {selectedPatient.root_canals ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* AI ANALYSIS */}
                <h2 className="font-bold">AI Analysis</h2>
                <Image
                  src={selectedPatient.photo_analyzed}
                  height={200}
                  width={200}
                  alt="Patient Gum Image"
                ></Image>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Last Analysis:</p>
                    <p className="font-medium">
                      {selectedPatient.last_analysis
                        ? new Date(
                            selectedPatient.last_analysis
                          ).toLocaleDateString("en-GB")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Analysis</p>
                    <p className="font-medium">
                      {parsedResult ? parsedResult.analysis : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Causes</p>
                    {parsedResult?.causes?.length ? (
                      parsedResult.causes.map((cause, i) => (
                        <p key={i}>{cause}</p>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Suggestions</p>
                    {parsedResult?.suggestions?.length ? (
                      parsedResult.suggestions.map((suggestion, i) => (
                        <p key={i}>{suggestion}</p>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center my-16">
                Select a patient to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
