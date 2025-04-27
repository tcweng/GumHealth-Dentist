"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  analysis_result: string;
  last_analysis: Date;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(
    null
  );
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

      console.log(user.id);

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

  if (!profile) return <div>Loading...</div>;

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
                <h2 className="text-2xl font-bold">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-600 text-sm">Phone Number:</p>
                    <p className="font-medium">
                      {selectedPatient.phone_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Birthday:</p>
                    <p className="font-medium">
                      {new Date(selectedPatient.birthday).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
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
                      {selectedPatient.blood_test ? "Uploaded" : "Not Uploaded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Gum Pain:</p>
                    <p className="font-medium">
                      {selectedPatient.gum_pain ? "Yes" : "No"}
                    </p>
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
