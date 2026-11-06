export const SAMPLE_AGREEMENTS = [
  {
    "id": "fair-standard",
    "title": "Standard Fair Residential Lease",
    "badge": "Low Risk",
    "badgeColor": "low",
    "description": "Standard 11-month residential tenancy agreement with balanced notice terms, refundable deposit, and fair repair allocations.",
    "filename": "fair_residential_lease.pdf",
    "path": "/samples/fair_residential_lease.pdf",
    "fileSize": 4734,
    "pages": 1,
    "hash": "0xacfaee86b17f06f88cda4e1efaf36c5a1006ceb1fe6e81d9a1aa49d1e759e40a",
    "extracted_text": "RENTSURE AUDIT SAMPLE DOCUMENT\nSTANDARD RESIDENTIAL LEASE AGREEMENT (BALANCED & FAIR)\n1. RENT AND PAYMENT: The tenant shall pay monthly rent of INR 25,000 on or before the fifth day of\neach calendar month by electronic bank transfer. The landlord shall provide a receipt upon request.\n2. SECURITY DEPOSIT: The tenant shall pay a refundable security deposit of INR 75,000 upon signing.\nThe deposit shall be refunded within fifteen days after handover of premises, less documented deductions\nsupported by itemised contractor receipts.\n3. TENANCY TERM: The tenancy term shall be eleven (11) months starting from the commencement\ndate, renewable by mutual written consent of both parties.\n4. TERMINATION AND NOTICE: Either party may terminate this agreement by providing sixty (60) days\nadvance written notice or rent in lieu thereof.\n5. MAINTENANCE AND REPAIRS: The landlord shall be responsible for structural repairs, major\nplumbing defects, and external maintenance. The tenant shall maintain interior fixtures in clean condition\nand pay for minor day-to-day wear consumables.\n6. UTILITIES: The tenant shall pay electricity, water, and internet bills based on actual metered utility bills\nand provider invoices provided monthly.\n7. PROPERTY ACCESS: The landlord may enter the premises for reasonable inspection or essential\nrepairs only upon providing at least 24 hours prior written notice to the tenant, except in life-threatening\nemergencies.\n8. DISPUTE RESOLUTION: Any dispute arising under this agreement shall first be referred to mutual\nconciliation, and if unresolved, to an agreed independent dispute resolver under the RentSure smart\ncontract protocol.\nRentSure Academic AI & Blockchain Prototype \u00b7 Verification Test Document\n",
    "analysis": {
      "overall_risk": "Low",
      "risk_score": 0,
      "total_clauses": 9,
      "clauses": [
        {
          "clause_number": 1,
          "category": "Rent and Payment",
          "text": "RENTSURE AUDIT SAMPLE DOCUMENT\nSTANDARD RESIDENTIAL LEASE AGREEMENT (BALANCED & FAIR)",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 2,
          "category": "Rent and Payment",
          "text": "1. RENT AND PAYMENT: The tenant shall pay monthly rent of INR 25,000 on or before the fifth day of\neach calendar month by electronic bank transfer. The landlord shall provide a receipt upon request.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 3,
          "category": "Security Deposit",
          "text": "2. SECURITY DEPOSIT: The tenant shall pay a refundable security deposit of INR 75,000 upon signing.\nThe deposit shall be refunded within fifteen days after handover of premises, less documented deductions\nsupported by itemised contractor receipts.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 4,
          "category": "General Terms",
          "text": "3. TENANCY TERM: The tenancy term shall be eleven (11) months starting from the commencement\ndate, renewable by mutual written consent of both parties.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 5,
          "category": "Rent and Payment",
          "text": "4. TERMINATION AND NOTICE: Either party may terminate this agreement by providing sixty (60) days\nadvance written notice or rent in lieu thereof.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 6,
          "category": "Maintenance and Repairs",
          "text": "5. MAINTENANCE AND REPAIRS: The landlord shall be responsible for structural repairs, major\nplumbing defects, and external maintenance. The tenant shall maintain interior fixtures in clean condition\nand pay for minor day-to-day wear consumables.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 7,
          "category": "Utilities and Bills",
          "text": "6. UTILITIES: The tenant shall pay electricity, water, and internet bills based on actual metered utility bills\nand provider invoices provided monthly.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 8,
          "category": "Maintenance and Repairs",
          "text": "7. PROPERTY ACCESS: The landlord may enter the premises for reasonable inspection or essential\nrepairs only upon providing at least 24 hours prior written notice to the tenant, except in life-threatening\nemergencies.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 9,
          "category": "Rent and Payment",
          "text": "8. DISPUTE RESOLUTION: Any dispute arising under this agreement shall first be referred to mutual\nconciliation, and if unresolved, to an agreed independent dispute resolver under the RentSure smart\ncontract protocol.\nRentSure Academic AI & Blockchain Prototype \u00b7 Verification Test Document",
          "risk_level": "Low",
          "risks": []
        }
      ],
      "missing_clauses": [
        {
          "name": "Rent Revision Conditions",
          "reason": "The agreement may not explain whether or how rent can be revised during the tenancy.",
          "status": "Potentially Missing"
        },
        {
          "name": "Agreement Duration and Tenancy Period",
          "reason": "The agreement may not clearly establish the duration of the tenancy.",
          "status": "Potentially Missing"
        }
      ],
      "disclaimer": "This automated analysis highlights potentially concerning wording and topics that may be missing. It is not legal advice and does not determine whether a clause is legally enforceable."
    }
  },
  {
    "id": "predatory-lease",
    "title": "High-Risk Predatory Landlord Agreement",
    "badge": "High Risk",
    "badgeColor": "high",
    "description": "Biased tenancy contract containing non-refundable deposit terms, immediate forfeiture, unannounced access, and unilateral rent spikes.",
    "filename": "predatory_landlord_lease.pdf",
    "path": "/samples/predatory_landlord_lease.pdf",
    "fileSize": 4265,
    "pages": 1,
    "hash": "0x5d626a8f13e6f55f97663f62684d5315b69291ddfbc86365ab77c2d661cb4164",
    "extracted_text": "RENTSURE AUDIT SAMPLE DOCUMENT\nRESIDENTIAL TENANCY AGREEMENT (HIGH-RISK RESTRICTIVE LEASE)\n1. RENT AND PAYMENT: The tenant must pay rent whenever demanded by the landlord, regardless of\ndate or amount, and the landlord may increase the rent at any time by any amount without prior notice.\n2. SECURITY DEPOSIT: The entire security deposit is non-refundable and will be retained by the landlord\nfor any reason. The deposit shall be forfeit under all circumstances if tenant departs prior to 24 months.\n3. PROPERTY ACCESS: The landlord may enter the premises at any time without notice or inspection\nschedule, with full unrestricted key access at the landlord's discretion.\n4. TERMINATION: The landlord may terminate the agreement immediately for any reason without notice\nand the tenant must immediately vacate the premises upon verbal notice.\n5. REPAIRS AND LIABILITIES: The tenant shall be subject to unlimited liability and without any monetary\nlimit pay for every repair regardless of cause, pre-existing condition, or whether or not caused by normal\nwear.\n6. DEDUCTIONS AND PENALTIES: The landlord may deduct any amount considered appropriate at sole\ndiscretion without providing evidence or invoices.\n7. RESTRICTIONS: No visitors or overnight guests are permitted under any circumstances, and subletting\nor room sharing is strictly forbidden under penalty of immediate eviction.\nRentSure Academic AI & Blockchain Prototype \u00b7 Verification Test Document\n",
    "analysis": {
      "overall_risk": "High",
      "risk_score": 62,
      "total_clauses": 8,
      "clauses": [
        {
          "clause_number": 1,
          "category": "Rent and Payment",
          "text": "RENTSURE AUDIT SAMPLE DOCUMENT\nRESIDENTIAL TENANCY AGREEMENT (HIGH-RISK RESTRICTIVE LEASE)",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 2,
          "category": "Rent and Payment",
          "text": "1. RENT AND PAYMENT: The tenant must pay rent whenever demanded by the landlord, regardless of\ndate or amount, and the landlord may increase the rent at any time by any amount without prior notice.",
          "risk_level": "High",
          "risks": [
            {
              "level": "High",
              "reason": "The clause may allow action without reasonable advance notice.",
              "recommendation": "Specify reasonable notice periods and exceptions for emergencies."
            },
            {
              "level": "Medium",
              "reason": "The rent revision terms may be unclear or allow unilateral increases.",
              "recommendation": "Specify when rent can change, the amount or method, and advance notice."
            }
          ]
        },
        {
          "clause_number": 3,
          "category": "Security Deposit",
          "text": "2. SECURITY DEPOSIT: The entire security deposit is non-refundable and will be retained by the landlord\nfor any reason. The deposit shall be forfeit under all circumstances if tenant departs prior to 24 months.",
          "risk_level": "High",
          "risks": [
            {
              "level": "High",
              "reason": "The deposit is described as non-refundable, even without specifying valid deductions.",
              "recommendation": "Clearly define refundable deposit conditions and itemised deductions."
            },
            {
              "level": "High",
              "reason": "The clause appears to permit complete deposit forfeiture in all circumstances.",
              "recommendation": "Specify permitted deductions and a fair deposit refund process."
            }
          ]
        },
        {
          "clause_number": 4,
          "category": "Property Access",
          "text": "3. PROPERTY ACCESS: The landlord may enter the premises at any time without notice or inspection\nschedule, with full unrestricted key access at the landlord's discretion.",
          "risk_level": "High",
          "risks": [
            {
              "level": "High",
              "reason": "The clause may allow action without reasonable advance notice.",
              "recommendation": "Specify reasonable notice periods and exceptions for emergencies."
            },
            {
              "level": "High",
              "reason": "One party appears to have broad unilateral decision-making power.",
              "recommendation": "Define objective conditions and require written communication for changes."
            }
          ]
        },
        {
          "clause_number": 5,
          "category": "Termination",
          "text": "4. TERMINATION: The landlord may terminate the agreement immediately for any reason without notice\nand the tenant must immediately vacate the premises upon verbal notice.",
          "risk_level": "High",
          "risks": [
            {
              "level": "High",
              "reason": "The clause may allow action without reasonable advance notice.",
              "recommendation": "Specify reasonable notice periods and exceptions for emergencies."
            },
            {
              "level": "High",
              "reason": "The clause may permit immediate termination without a remedy period.",
              "recommendation": "Define valid termination grounds and an appropriate notice or remedy period."
            }
          ]
        },
        {
          "clause_number": 6,
          "category": "Maintenance and Repairs",
          "text": "5. REPAIRS AND LIABILITIES: The tenant shall be subject to unlimited liability and without any monetary\nlimit pay for every repair regardless of cause, pre-existing condition, or whether or not caused by normal\nwear.",
          "risk_level": "High",
          "risks": [
            {
              "level": "High",
              "reason": "The clause may impose liability without a clear limit or fault requirement.",
              "recommendation": "Define responsibility, causation and reasonable limits on liability."
            }
          ]
        },
        {
          "clause_number": 7,
          "category": "General Terms",
          "text": "6. DEDUCTIONS AND PENALTIES: The landlord may deduct any amount considered appropriate at sole\ndiscretion without providing evidence or invoices.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 8,
          "category": "Rent and Payment",
          "text": "7. RESTRICTIONS: No visitors or overnight guests are permitted under any circumstances, and subletting\nor room sharing is strictly forbidden under penalty of immediate eviction.\nRentSure Academic AI & Blockchain Prototype \u00b7 Verification Test Document",
          "risk_level": "Low",
          "risks": []
        }
      ],
      "missing_clauses": [
        {
          "name": "Utilities and Bill Payments",
          "reason": "The agreement may not specify who is responsible for utility payments.",
          "status": "Potentially Missing"
        },
        {
          "name": "Dispute Resolution",
          "reason": "The agreement may not clearly describe how disagreements between the parties will be handled.",
          "status": "Potentially Missing"
        },
        {
          "name": "Agreement Duration and Tenancy Period",
          "reason": "The agreement may not clearly establish the duration of the tenancy.",
          "status": "Potentially Missing"
        }
      ],
      "disclaimer": "This automated analysis highlights potentially concerning wording and topics that may be missing. It is not legal advice and does not determine whether a clause is legally enforceable."
    }
  },
  {
    "id": "ambiguous-lease",
    "title": "Ambiguous Short-Form Student Flat Lease",
    "badge": "Missing Protections",
    "badgeColor": "medium",
    "description": "Vague informal agreement omitting key legal safeguards regarding repairs, utilities, deposit refund schedules, and notice durations.",
    "filename": "ambiguous_student_lease.pdf",
    "path": "/samples/ambiguous_student_lease.pdf",
    "fileSize": 2918,
    "pages": 1,
    "hash": "0x405e6b43aa5a703950ac099e62322c17740127dfd33cf587543d8b558d0b330d",
    "extracted_text": "RENTSURE AUDIT SAMPLE DOCUMENT\nROOM RENTAL MEMORANDUM (AMBIGUOUS SHORT-FORM)\n1. RENT: The occupant agrees to pay monthly rent of INR 12,000 at the start of each month.\n2. DEPOSIT: A deposit of INR 24,000 is given at key handover and will be returned when convenient to\nthe landlord after inspection.\n3. HOUSE RULES: Occupant must keep the room tidy, not cause disturbances, and share cleaning duties\nwith co-tenants.\n4. VACATING: The tenant may leave after giving notice, but the notice period is not specified.\nRentSure Academic AI & Blockchain Prototype \u00b7 Verification Test Document\n",
    "analysis": {
      "overall_risk": "Low",
      "risk_score": 0,
      "total_clauses": 5,
      "clauses": [
        {
          "clause_number": 1,
          "category": "Rent and Payment",
          "text": "RENTSURE AUDIT SAMPLE DOCUMENT\nROOM RENTAL MEMORANDUM (AMBIGUOUS SHORT-FORM)",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 2,
          "category": "Rent and Payment",
          "text": "1. RENT: The occupant agrees to pay monthly rent of INR 12,000 at the start of each month.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 3,
          "category": "Security Deposit",
          "text": "2. DEPOSIT: A deposit of INR 24,000 is given at key handover and will be returned when convenient to\nthe landlord after inspection.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 4,
          "category": "General Terms",
          "text": "3. HOUSE RULES: Occupant must keep the room tidy, not cause disturbances, and share cleaning duties\nwith co-tenants.",
          "risk_level": "Low",
          "risks": []
        },
        {
          "clause_number": 5,
          "category": "Rent and Payment",
          "text": "4. VACATING: The tenant may leave after giving notice, but the notice period is not specified.\nRentSure Academic AI & Blockchain Prototype \u00b7 Verification Test Document",
          "risk_level": "Low",
          "risks": []
        }
      ],
      "missing_clauses": [
        {
          "name": "Security Deposit Refund Conditions",
          "reason": "The agreement may not clearly explain when and how the security deposit will be returned.",
          "status": "Potentially Missing"
        },
        {
          "name": "Maintenance and Repair Responsibilities",
          "reason": "Responsibilities for property maintenance and repairs may not be clearly defined.",
          "status": "Potentially Missing"
        },
        {
          "name": "Utilities and Bill Payments",
          "reason": "The agreement may not specify who is responsible for utility payments.",
          "status": "Potentially Missing"
        },
        {
          "name": "Rent Revision Conditions",
          "reason": "The agreement may not explain whether or how rent can be revised during the tenancy.",
          "status": "Potentially Missing"
        },
        {
          "name": "Dispute Resolution",
          "reason": "The agreement may not clearly describe how disagreements between the parties will be handled.",
          "status": "Potentially Missing"
        },
        {
          "name": "Agreement Duration and Tenancy Period",
          "reason": "The agreement may not clearly establish the duration of the tenancy.",
          "status": "Potentially Missing"
        }
      ],
      "disclaimer": "This automated analysis highlights potentially concerning wording and topics that may be missing. It is not legal advice and does not determine whether a clause is legally enforceable."
    }
  }
];
