// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Pill,
  Flex,
  Select,
  Option,
  Notification,
  SectionHeading,
  Paragraph,
} from "@contentful/forma-36-react-components";
import { FieldExtensionSDK } from "contentful-ui-extensions-sdk";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field = (props: FieldProps) => {
  const [newValue, setNewValue] = useState("");
  const [values, setValues] = useState(props.sdk.field.getValue() || []);
  const [allEntryValues, setAllEntryValues] = useState([]);

  const fieldName = props.sdk.field.id;

  function updateFieldValue() {
    if (values && values.includes(newValue)) {
      return Notification.warning(`${newValue} has already been added.`, {
        duration: 3000,
        canClose: true,
        title: "STOP FUCKING AROUND",
      });
    }
    values && newValue
      ? props.sdk.field.setValue([...values, newValue])
      : props.sdk.field.setValue([newValue]);
    setNewValue("");
  }

  function updateFieldValueSelect(e) {
    if (values && values.includes(e.target.value)) {
      return Notification.warning(`${e.target.value} has already been added`, {
        duration: 3000,
        canClose: true,
        title: "STOP FUCKING AROUND",
      });
    }
    props.sdk.field.setValue([...values, e.target.value]);
  }

  function removeValue(v) {
    const filtered = values.filter((val) => val !== v);
    props.sdk.field.setValue(filtered);
  }

  useEffect(() => {
    // makes sure the iframe window height makes the whole component visible
    props.sdk.window.startAutoResizer();
    const allEntries = props.sdk.space.getEntries();
    const allValues = [];
    let uniqueValues = null;
    allEntries.then((entries) => {
      entries.items.forEach((e) => {
        if (
          e.fields.hasOwnProperty(fieldName) &&
          e.fields[fieldName].hasOwnProperty("en-US")
        ) {
          e.fields[fieldName]["en-US"].forEach((t) => {
            allValues.push(t);
          });
        }
      });
      uniqueValues = allValues.filter(function (item, pos) {
        return allValues.indexOf(item) === pos;
      });
      setAllEntryValues(uniqueValues);
    });
  }, []);

  props.sdk.field.onValueChanged((value) => {
    if (value && value.length !== values.length) {
      setValues(value);
    }
  });

  return (
    <>
      <TextField
        onChange={(e) => setNewValue(e.target.value)}
        value={newValue}
        labelText={`Add a new ${fieldName}`}
        textInputProps={{
          placeholder: `type a new ${fieldName} and hit the add button`,
        }}
      />

      <Button style={{ margin: "1em 0" }} onClick={updateFieldValue}>
        Add
      </Button>
      <SectionHeading element="H6">
        Or select an existing {fieldName}
      </SectionHeading>
      <Select
        style={{ marginBottom: "1em" }}
        onChange={(e) => updateFieldValueSelect(e)}
      >
        {allEntryValues &&
          allEntryValues.sort().map((v) => (
            <Option value={v} key={v}>
              {v}
            </Option>
          ))}
      </Select>

      {values ? (
        <Flex
          flexDirection="row"
          justifyContent="start"
          alignItems="start"
          flexWrap="wrap"
        >
          {values.map((v) => (
            <>
              <Pill
                style={{ margin: ".25em" }}
                onClose={() => removeValue(v)}
                label={v}
                key={v}
              />
            </>
          ))}
        </Flex>
      ) : (
        ""
      )}
    </>
  );
};

export default Field;
