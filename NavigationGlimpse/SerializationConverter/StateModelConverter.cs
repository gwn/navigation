﻿using Glimpse.Core.Extensibility;
using Navigation.Glimpse.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Navigation.Glimpse.SerializationConverter
{
	public class StateModelConverter : SerializationConverter<StateModel>
	{
		private readonly HashSet<string> _reservedKeys = new HashSet<string> { "key", "page", "controller", "apiController", 
			"action", "route", "title", "defaultTypes", "defaults", "derived", "trackCrumbTrail", "masters", "theme", "checkPhysicalUrlAccess"};

		public override object Convert(StateModel stateModel)
		{
			return new
			{
				stateModel.State.Key,
				stateModel.State.Index,
				stateModel.X,
				stateModel.Y,
				stateModel.W,
				stateModel.H,
				stateModel.Current,
				stateModel.Previous,
				stateModel.Back,
				Selected = stateModel.Current,
				DialogKey = stateModel.State.Parent.Key,
				Data = GetDictionary(stateModel.Data),
				stateModel.Page,
				stateModel.Controller,
				stateModel.ApiController,
				stateModel.Action,
				stateModel.State.Title,
				stateModel.Route,
				stateModel.Theme,
				stateModel.Masters,
				DefaultTypes = GetDictionary<Type>(stateModel.State.DefaultTypes),
				stateModel.State.Derived,
				stateModel.State.TrackCrumbTrail,
				stateModel.State.CheckPhysicalUrlAccess,
				stateModel.NavigationLinks,
				Attributes = GetAttributes(stateModel.State),
			};
		}

		private Dictionary<string, object> GetDictionary(NavigationData data)
		{
			var dictionary = new Dictionary<string, object>();
			foreach (NavigationDataItem item in data.OrderBy(i => i.Key))
				dictionary[item.Key] = item.Value;
			return dictionary;
		}

		private Dictionary<string, object> GetDictionary<T>(StateInfoCollection<T> coll)
		{
			var dictionary = new Dictionary<string, object>();
			foreach (string key in coll.Keys)
				dictionary[key] = coll[key];
			return dictionary;
		}

		private Dictionary<string, string> GetAttributes(State state)
		{
			var attributes = new Dictionary<string, string>();
			foreach(string key in state.Attributes.Keys)
			{
				if (!_reservedKeys.Contains(key))
					attributes[key] = state.Attributes[key];
			}
			return attributes;
		}
	}
}
